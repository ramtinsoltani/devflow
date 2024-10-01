import mongoose from 'mongoose';
import { DbCollection, DbItem } from '../models/database';
import { IRequestNewCollection, IRequestNewItem, IRequestUpdateCollection, IRequestUpdateItem } from '../models/requests';
import { ICollection, IItem } from '../models/normalized';
import { normalizeCommonDocument } from '../lib/normalizer';
import { ServerError } from '../lib/error';
import { queryStringToRegex } from '../lib/utilities';

export class DatabaseService {

  /**
   * Initializes the database service by connecting to MongoDB using the configuration in ".env" file.
   */
  public async init(): Promise<void> {

    await mongoose.connect(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`);

  }

  /**
   * Creates a new collection.
   * @param data New collection request object
   * @returns New collection's ID
   */
  public async createCollection(data: IRequestNewCollection): Promise<string> {

    const collection = new DbCollection({
      name: data.name,
      color: data.color
    });

    await collection.save();

    return collection._id.toString();

  }

  /**
   * Reads all collections from the database.
   * @returns An array of normalized collection objects
   */
  public async getCollections(): Promise<ICollection[]> {

    const collections = await DbCollection.find({}).sort({ createdAt: 1 });

    return collections.map(c => normalizeCommonDocument(c) as ICollection);

  }

  /**
   * Updates a collection in the database.
   * @param id Collection ID
   * @param data Update collection request object
   */
  public async updateCollection(id: string, data: IRequestUpdateCollection): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Collection ID missing!');

    const doc = await DbCollection.findById(id);

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find collection with ID "${id}"!`);

    await doc.updateOne(data);

  }

  /**
   * Deletes a collection from the database.
   * @param id Collection ID
   */
  public async deleteCollection(id: string): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Collection ID missing!');

    const doc = await DbCollection.findById(id);

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find collection with ID "${id}"!`);

    await doc.deleteOne();
    await DbItem.deleteMany({ collectionId: id });

  }

  /**
   * Reads an item from the database.
   * @param id Item ID
   * @returns Normalized item object
   */
  public async getItem(id: string): Promise<IItem> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Missing item ID!');

    const item = await DbItem.findById(id);

    if ( ! item )
      throw new ServerError('not-found', `No item found with ID "${id}"!`);

    return normalizeCommonDocument(item);

  }

  /**
   * Reads all items under a certain collection in the database.
   * @param collectionId Collection ID
   * @returns Array or normalized item objects
   */
  public async getItems(collectionId: string): Promise<IItem[]> {

    if ( ! collectionId )
      throw new ServerError('invalid-request', 'Missing collection ID!');

    const items = await DbItem.find({ collectionId }).sort({ createdAt: -1 });

    return items.map(i => normalizeCommonDocument(i));

  }
  
  /**
   * Creates a new item under an existing collection in the database.
   * @param data New item request object
   * @returns ID of the newly created item
   */
  public async createItem(data: IRequestNewItem): Promise<string> {

    const collection = await DbCollection.findById(data.collectionId);
    
    if ( ! collection )
      throw new ServerError('invalid-request', `Could not find collection with ID "${ data.collectionId }"!`);

    data.tags = data.tags.map(t => ({ ...t, label: t.label.trim().toLowerCase() }));
    
    const item = new DbItem(data);

    await item.save();

    await collection.updateOne({ size: collection.size + 1 });

    return item._id.toString();

  }

  /**
   * Updates an item in the database.
   * @param id Item ID
   * @param data Update item request object
   */
  public async updateItem(id: string, data: IRequestUpdateItem): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Missing item ID!');

    const doc = await DbItem.findById(id);

    if ( ! doc )
      throw new ServerError('invalid-request', `No item found with ID "${ id }"!`)

    if ( data.title ) doc.title = data.title;
    if ( data.url ) doc.url = data.url;

    if ( data.description ) doc.description = data.description;
    else if ( data.description === null ) doc.description = undefined;

    if ( data.posterUrl ) doc.posterUrl = data.posterUrl;
    else if ( data.posterUrl === null ) doc.posterUrl = undefined;

    if ( data.tags ) {

      doc.tags.splice(0, doc.tags.length);
      doc.tags.push(...data.tags.map(t => ({ ...t, label: t.label.trim().toLowerCase() })));

    }

    await doc.save();

  }

  /**
   * Deletes an item from the database.
   * @param id Item ID
   */
  public async deleteItem(id: string): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Missing item ID!');

    const doc = await DbItem.findById(id);

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find item with ID "${ id }"!`)

    await doc.deleteOne();
    
    const collection = await DbCollection.findById(doc.collectionId);

    if ( collection )
      await collection.updateOne({ size: collection.size - 1 });

  }

  /**
   * Searches for collections in the database.
   * @param q Text search query
   * @returns Array of normalized collection objects
   */
  public async searchCollections(q: string): Promise<ICollection[]> {

    if ( ! q?.trim().length )
      return this.getCollections();

    const qregex = queryStringToRegex(q);
    const docs = await DbCollection.find({ name: { $regex: qregex.regex, $options: qregex.flags } });

    return docs.map(c => normalizeCommonDocument(c) as ICollection);

  }

  /**
   * Searches for items under an existing collection in the database.
   * @param collectionId Collection ID
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @returns Array of normalized item objects
   */
  public async searchCollectionItems(collectionId: string, q?: string, tags?: string[]): Promise<IItem[]> {

    if ( ! collectionId )
      throw new ServerError('invalid-request', 'No collection specified!');
    else if ( ! await DbCollection.findById(collectionId) )
      throw new ServerError('invalid-request', `Could not find collection with ID "${ collectionId }"!`);
    else if ( ! q?.trim().length && ! tags?.length )
      throw new ServerError('invalid-request', 'No search criteria defined!');

    const query: any = {
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
   * @param q Text search query
   * @param tags Array of tags to include in search
   * @returns Array of normalized item objects
   */
  public async searchItems(q?: string, tags?: string[]): Promise<IItem[]> {

    if ( ! q?.trim().length && ! tags?.length )
      throw new ServerError('invalid-request', 'No search criteria defined!');

    const query: any = {};

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

}