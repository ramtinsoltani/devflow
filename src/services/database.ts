import mongoose from 'mongoose';
import { DbCollection, DbItem, DbPermission, DbSpace } from '../models/database';
import { IRequestNewCollection, IRequestNewItem, IRequestNewPermission, IRequestNewSpace, IRequestUpdateCollection, IRequestUpdateItem, IRequestUpdateSpace } from '../models/requests';
import { ICollection, IItem, IPermission, ISpace, Permission } from '../models/normalized';
import { normalizeCommonDocument } from '../lib/normalizer';
import { ServerError } from '../lib/error';
import { queryStringToRegex } from '../lib/utilities';
import { Service } from './common';
import { DecodedIdToken } from 'firebase-admin/auth';

export class DatabaseService implements Service {

  /**
   * Initializes the database service by connecting to MongoDB using the configuration in ".env" file.
   */
  public async init(): Promise<void> {

    await mongoose.connect(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`);

  }

  /**
   * Retrieves the true owner UID of a space from the perspective of a grantee if the grantee was given the required permission to access the space, null otherwise.
   * @param grantee Decoded token of an authorized user as grantee
   * @param spaceId Space ID
   * @param permission Required operation permission
   * @returns A promise with the true owner UID of the space
   */
  private async getOwnerFromPermission(grantee: DecodedIdToken, spaceId: string, permission: Permission): Promise<string | null> {

    const doc = await DbPermission.findOne({ grantedTo: grantee.uid, spaceId });

    if ( ! doc )
      return null;

    if ( doc.permission === permission || (doc.permission === Permission.CanModifyContent && permission === Permission.ReadOnly) )
      return doc.owner;

    return null;

  }

  /**
   * Enforces permission and returns the true owner UID of a space.
   * If the current authorized user is the owner, their UID will be returned.
   * Otherwise, an attempt will be made to retrieve the true owner UID if the required permission was given to the current user as grantee.
   * If permission was not granted, this method will throw a server error, otherwise the true owner UID will be returned.
   * @param token Decoded token of an authorized user
   * @param spaceId Space ID
   * @param spaceOwner Space owner
   * @param permission Required permission for the current operation
   * @returns A promise with the true owner UID
   */
  private async enforcePermission(token: DecodedIdToken, spaceId: string, spaceOwner: string, permission: Permission): Promise<string> {

    let trueOwner: string = token.uid;

    // If not the owner of space
    if ( spaceOwner !== token.uid ) {

      // Check if user has permission to modify content within this space
      const owner = await this.getOwnerFromPermission(token, spaceId, permission);

      if ( ! owner )
        throw new ServerError('invalid-request', 'Operation denied due to lack of permissions!');

      // Set the true owner (performing this operation on behalf of the true owner)
      trueOwner = owner;

    }

    return trueOwner;

  }

  /**
   * Creates a new space.
   * @param token The decoded token of an authorized user
   * @param data New space request object
   * @returns New space's ID
   */
  public async createSpace(token: DecodedIdToken, data: IRequestNewSpace): Promise<string> {

    const space = new DbSpace({
      owner: token.uid,
      name: data.name
    });

    await space.save();

    return space._id.toString();

  }

  /**
   * Reads all spaces in the database.
   * @param token The decoded token of an authorized user
   * @returns An array of normalized space objects
   */
  public async getSpaces(token: DecodedIdToken): Promise<ISpace[]> {

    // Get all spaces owned by the authorized user
    const spaces = await DbSpace.find({ owner: token.uid }).sort({ createdAt: 1 });

    // Get all shared spaces
    let sharedSpaces: ISpace[] = [];
    const permissions = await DbPermission.find({ grantedTo: token.uid, accepted: true });

    if ( permissions.length ) {

      // Map all space ids to permission settings from all granted permissions to this authorized user
      const granted = new Map<string, Permission>();

      for ( const permission of permissions )
        granted.set(permission.spaceId.toString(), permission.permission);

      // Find all spaces shared with this user
      sharedSpaces = (await DbSpace.find({ _id: { $in: Array.from(granted.keys()) } }))
      .map(s => normalizeCommonDocument(s) as ISpace)
      // Attach virtual fields
      .map(s => ({ ...s, shared: true, permission: granted.get(s.id) as Permission }));

    }

    return spaces
    .map(s => normalizeCommonDocument(s) as ISpace)
    .concat(sharedSpaces);

  }

  /**
   * Updates a space in the database.
   * @param token The decoded token of an authorized user
   * @param id Space ID
   * @param data Update space request object
   */
  public async updateSpace(token: DecodedIdToken, id: string, data: IRequestUpdateSpace): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Space ID missing!');

    const doc = await DbSpace.findOne({ _id: id, owner: token.uid });

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find space with ID "${id}"!`);

    await doc.updateOne(data);

  }

  /**
   * Deletes a space from the database.
   * @param token The decoded token of an authorized user
   * @param id Space ID
   */
  public async deleteSpace(token: DecodedIdToken, id: string): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Space ID missing!');

    const doc = await DbSpace.findOne({ _id: id, owner: token.uid });

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find space with ID "${id}"!`);

    await doc.deleteOne();
    await DbCollection.deleteMany({ spaceId: id, owner: token.uid });
    await DbItem.deleteMany({ spaceId: id, owner: token.uid });

  }

  /**
   * Creates a new collection.
   * @param token The decoded token of an authorized user
   * @param spaceId Space ID
   * @param data New collection request object
   * @returns New collection's ID
   */
  public async createCollection(token: DecodedIdToken, spaceId: string, data: IRequestNewCollection): Promise<string> {

    if ( ! spaceId )
      throw new ServerError('invalid-request', 'Space ID missing!');

    const space = await DbSpace.findById(spaceId);

    if ( ! space )
      throw new ServerError('invalid-request', `Could not find space with ID "${spaceId}"!`);

    const collection = new DbCollection({
      owner: await this.enforcePermission(token, spaceId, space.owner, Permission.CanModifyContent),
      spaceId,
      name: data.name,
      color: data.color
    });

    await collection.save();

    return collection._id.toString();

  }

  /**
   * Reads all collections in the gives space from the database.
   * @param token The decoded token of an authorized user
   * @param spaceId Space ID
   * @returns An array of normalized collection objects
   */
  public async getCollections(token: DecodedIdToken, spaceId: string): Promise<ICollection[]> {

    if ( ! spaceId )
      throw new ServerError('invalid-request', 'Space ID missing!');

    const collections = await DbCollection.find({ spaceId }).sort({ createdAt: 1 });

    if ( collections.length )
      await this.enforcePermission(token, spaceId, collections[0].owner, Permission.ReadOnly);

    return collections.map(c => normalizeCommonDocument(c) as ICollection);

  }

  /**
   * Updates a collection in the database.
   * @param token The decoded token of an authorized user
   * @param id Collection ID
   * @param data Update collection request object
   */
  public async updateCollection(token: DecodedIdToken, spaceId: string, id: string, data: IRequestUpdateCollection): Promise<void> {
    
    if ( ! id )
      throw new ServerError('invalid-request', 'Collection ID missing!');

    const doc = await DbCollection.findOne({ _id: id, spaceId });

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find collection with ID "${id}"!`);

    await this.enforcePermission(token, spaceId, doc.owner, Permission.CanModifyContent);

    await doc.updateOne(data);

  }

  /**
   * Deletes a collection from the database.
   * @param token The decoded token of an authorized user
   * @param id Collection ID
   */
  public async deleteCollection(token: DecodedIdToken, spaceId: string, id: string): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Collection ID missing!');

    const doc = await DbCollection.findOne({ _id: id, spaceId });

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find collection with ID "${id}"!`);

    await this.enforcePermission(token, spaceId, doc.owner, Permission.CanModifyContent);

    await doc.deleteOne();
    await DbItem.deleteMany({ spaceId, collectionId: id });

  }

  /**
   * Reads an item from the database.
   * @param token The decoded token of an authorized user
   * @param id Item ID
   * @returns Normalized item object
   */
  public async getItem(token: DecodedIdToken, spaceId: string, id: string): Promise<IItem> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Missing item ID!');

    const item = await DbItem.findOne({ _id: id, spaceId });

    if ( ! item )
      throw new ServerError('not-found', `No item found with ID "${id}"!`);

    await this.enforcePermission(token, spaceId, item.owner, Permission.ReadOnly);

    return normalizeCommonDocument(item);

  }

  /**
   * Reads all items under a certain collection in the database.
   * @param token The decoded token of an authorized user
   * @param collectionId Collection ID
   * @returns Array or normalized item objects
   */
  public async getItems(token: DecodedIdToken, spaceId: string, collectionId: string): Promise<IItem[]> {

    if ( ! collectionId )
      throw new ServerError('invalid-request', 'Missing collection ID!');

    const items = await DbItem.find({ collectionId, spaceId }).sort({ createdAt: -1 });

    if ( items.length )
      await this.enforcePermission(token, spaceId, items[0].owner, Permission.ReadOnly);

    return items.map(i => normalizeCommonDocument(i));

  }
  
  /**
   * Creates a new item under an existing collection in the database.
   * @param token The decoded token of an authorized user
   * @param data New item request object
   * @returns ID of the newly created item
   */
  public async createItem(token: DecodedIdToken, spaceId: string, data: IRequestNewItem): Promise<string> {

    const collection = await DbCollection.findOne({ _id: data.collectionId, spaceId });
    
    if ( ! collection )
      throw new ServerError('invalid-request', `Could not find collection with ID "${ data.collectionId }"!`);

    const trueOwner = await this.enforcePermission(token, spaceId, collection.owner, Permission.CanModifyContent);

    data.tags = data.tags.map(t => ({ ...t, label: t.label.trim().toLowerCase() }));
    
    const item = new DbItem({
      ...data,
      spaceId: collection.spaceId,
      owner: trueOwner
    });

    await item.save();

    await collection.updateOne({ size: collection.size + 1 });

    return item._id.toString();

  }

  /**
   * Updates an item in the database.
   * @param token The decoded token of an authorized user
   * @param id Item ID
   * @param data Update item request object
   */
  public async updateItem(token: DecodedIdToken, spaceId: string, id: string, data: IRequestUpdateItem): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Missing item ID!');

    const doc = await DbItem.findOne({ _id: id, spaceId });

    if ( ! doc )
      throw new ServerError('invalid-request', `No item found with ID "${ id }"!`);

    await this.enforcePermission(token, spaceId, doc.owner, Permission.CanModifyContent);

    if ( data.title ) doc.title = data.title;
    if ( data.url ) doc.url = data.url;

    if ( data.description ) doc.description = data.description;
    else if ( data.description === null ) doc.description = undefined;

    if ( data.posterUrl ) doc.posterUrl = data.posterUrl;
    else if ( data.posterUrl === null ) doc.posterUrl = undefined;

    if ( data.originTitle ) doc.originTitle = data.originTitle;
    else if ( data.originTitle === null ) doc.originTitle = undefined;

    if ( data.originUrl ) doc.originUrl = data.originUrl;
    else if ( data.originUrl === null ) doc.originUrl = undefined;

    if ( data.favicon ) doc.favicon = data.favicon;
    else if ( data.favicon === null ) doc.favicon = undefined;

    doc.forceAltLayout = data.forceAltLayout;

    if ( data.tags ) {

      doc.tags.splice(0, doc.tags.length);
      doc.tags.push(...data.tags.map(t => ({ ...t, label: t.label.trim().toLowerCase() })));

    }

    await doc.save();

  }

  /**
   * Deletes an item from the database.
   * @param token The decoded token of an authorized user
   * @param id Item ID
   */
  public async deleteItem(token: DecodedIdToken, spaceId: string, id: string): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Missing item ID!');

    const doc = await DbItem.findOne({ _id: id, spaceId });

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find item with ID "${ id }"!`);

    await this.enforcePermission(token, spaceId, doc.owner, Permission.CanModifyContent);

    await doc.deleteOne();
    
    const collection = await DbCollection.findOne({ _id: doc.collectionId, spaceId });

    if ( collection )
      await collection.updateOne({ size: collection.size - 1 });

  }

  /**
   * Searches for items under an existing collection in the database.
   * @param token The decoded token of an authorized user
   * @param collectionId Collection ID
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @returns Array of normalized item objects
   */
  public async searchCollectionItems(token: DecodedIdToken, spaceId: string, collectionId: string, q?: string, tags?: string[]): Promise<IItem[]> {

    if ( ! collectionId )
      throw new ServerError('invalid-request', 'No collection specified!');

    const collection = await DbCollection.findOne({ _id: collectionId, spaceId });
    
    if ( ! collection )
      throw new ServerError('invalid-request', `Could not find collection with ID "${ collectionId }"!`);
    
    if ( ! q?.trim().length && ! tags?.length )
      throw new ServerError('invalid-request', 'No search criteria defined!');

    await this.enforcePermission(token, spaceId, collection.owner, Permission.ReadOnly);

    const query: any = {
      spaceId,
      collectionId
    };

    if ( q?.trim() ) {

      const qregex = queryStringToRegex(q);

      query.title = { $regex: qregex.regex, $options: qregex.flags };

    }

    if ( tags?.length ) {

      query['tags.label'] = { $in: tags.map(t => t.trim().toLowerCase()).filter(t => t.length) };

    }

    const docs = await DbItem.find(query);

    return docs.map(i => normalizeCommonDocument(i) as IItem);

  }
  
  /**
   * Searches for items across all collections in the database.
   * @param token The decoded token of an authorized user
   * @param spaceId Space ID
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @returns Array of normalized item objects
   */
  public async searchItems(token: DecodedIdToken, spaceId: string, q?: string, tags?: string[]): Promise<IItem[]> {

    if ( ! spaceId )
      throw new ServerError('invalid-request', 'Space ID missing!');

    if ( ! q?.trim().length && ! tags?.length )
      throw new ServerError('invalid-request', 'No search criteria defined!');

    const space = await DbSpace.findById(spaceId);

    if ( ! space )
      throw new ServerError('invalid-request', `Could not find space with ID "${spaceId}"!`);

    await this.enforcePermission(token, spaceId, space.owner, Permission.ReadOnly);

    const query: any = { spaceId };

    if ( q?.trim() ) {

      const qregex = queryStringToRegex(q);

      query.title = { $regex: qregex.regex, $options: qregex.flags };

    }

    if ( tags?.length ) {

      query['tags.label'] = { $in: tags.map(t => t.trim().toLowerCase()).filter(t => t.length) };

    }

    const docs = await DbItem.find(query);

    return docs.map(i => normalizeCommonDocument(i) as IItem);
    
  }

  /**
   * Returns all permissions provisioned by the authenticated user for the given space.
   * @param token The decoded token of an authorized user
   * @param spaceId Space ID
   * @returns Array of permission objects
   */
  public async getProvisionedPermissions(token: DecodedIdToken, spaceId: string): Promise<IPermission[]> {

    if ( ! spaceId )
      throw new ServerError('invalid-request', 'Space ID missing!');

    const docs = await DbPermission.find({ owner: token.uid, spaceId });

    return docs.map(p => normalizeCommonDocument(p) as IPermission);

  }

  /**
   * Returns all permissions granted to the authorized user by other users that are pending acceptance.
   * @param token The decoded token of an authorized user
   * @returns Array of permission objects
   */
  public async getPendingPermissions(token: DecodedIdToken): Promise<IPermission[]> {

    const docs = await DbPermission.find({ grantedTo: token.uid, accepted: false });

    return docs.map(p => normalizeCommonDocument(p) as IPermission);

  }

  /**
   * Provisions a new permission by the authorized user to another user.
   * @param token A decoded token of an authorized user
   * @param data New permission request body
   * @returns A void promise
   */
  public async provisionNewPermission(token: DecodedIdToken, data: IRequestNewPermission): Promise<void> {

    // Check if space exists under the ownership of the authorized user
    const space = await DbSpace.findOne({ _id: data.spaceId, owner: token.uid });

    if ( ! space )
      throw new ServerError('invalid-request', `No space found with ID "${data.spaceId}"!`);

    // Check if the grantee is a registered user in Firebase auth
    const grantee = await services.auth.getUserFromEmail(data.grantee);

    if ( ! grantee )
      throw new ServerError('invalid-request', `Could not provision permission because the grantee email is not a registered user!`);

    // Check if grantee is the same as provisioner
    if ( grantee.uid === token.uid )
      throw new ServerError('invalid-request', 'Could not provision permission because grantee and provisioner are the same!');

    // Check if permission was already granted (whether accepted or not)
    if ( await DbPermission.findOne({ owner: token.uid, grantedTo: grantee.uid, spaceId: data.spaceId }) )
      throw new ServerError('invalid-request', 'A permission to the same user for the same space has already been provisioned! Please revoke that first before provisioning a new permission with the same criteria.');

    // Provision the new permission
    const doc = new DbPermission({
      owner: token.uid,
      grantedTo: grantee.uid,
      granteeName: grantee.displayName,
      granteeEmail: grantee.email,
      provisionerName: token.name,
      provisionerEmail: token.email,
      spaceName: space.name,
      spaceId: data.spaceId,
      permission: data.permission,
      accepted: false
    });

    await doc.save();

  }

  /**
   * Accepts a permission provisioned by another user for the current authorized user.
   * @param token Decoded token of an authorized user
   * @param permissionId Permission ID
   * @returns A void promise
   */
  public async acceptPermission(token: DecodedIdToken, permissionId: string): Promise<void> {

    const doc = await DbPermission.findOne({ _id: permissionId, grantedTo: token.uid });

    if ( ! doc )
      throw new ServerError('invalid-request', `No permissions found with ID "${permissionId}!`);

    if ( doc.accepted )
      throw new ServerError('invalid-request', `Permission was already accepted!`);

    doc.accepted = true;

    await doc.save();

  }

  /**
   * Revokes a permission provisioned by the authorized user.
   * @param token Decoded token of an authorized user
   * @param permissionId Permission ID
   * @returns A void promise
   */
  public async revokePermission(token: DecodedIdToken, permissionId: string): Promise<void> {

    const doc = await DbPermission.findOne({ _id: permissionId, owner: token.uid });

    if ( ! doc )
      throw new ServerError('invalid-request', `No permissions found with ID "${permissionId}!`);

    await doc.deleteOne();

  }

  /**
   * Revokes a permission granted to the authorized user.
   * @param token Decoded token of an authorized user
   * @param permissionId Permission ID
   * @returns A void promise
   */
  public async selfRevokePermission(token: DecodedIdToken, permissionId: string): Promise<void> {

    const doc = await DbPermission.findOne({ _id: permissionId, grantedTo: token.uid });

    if ( ! doc )
      throw new ServerError('invalid-request', `No permissions found with ID "${permissionId}!`);

    await doc.deleteOne();

  }

}