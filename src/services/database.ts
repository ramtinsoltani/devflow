import mongoose from 'mongoose';
import { DbCollection, DbItem } from '../models/database';
import { IRequestNewCollection, IRequestNewItem, IRequestUpdateCollection, IRequestUpdateItem } from '../models/requests';
import { ICollection, IItem } from '../models/normalized';
import { normalizeCommonDocument } from '../lib/normalizer';
import { ServerError } from '../lib/error';
import { queryStringToRegex } from '../lib/utilities';

export class DatabaseService {

  public async init(): Promise<void> {

    await mongoose.connect(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`);

  }

  public async createCollection(data: IRequestNewCollection): Promise<string> {

    const collection = new DbCollection({
      name: data.name,
      color: data.color
    });

    await collection.save();

    return collection._id.toString();

  }

  public async getCollections(): Promise<ICollection[]> {

    const collections = await DbCollection.find({});

    return collections.map(c => normalizeCommonDocument(c) as ICollection);

  }

  public async updateCollection(id: string, data: IRequestUpdateCollection): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Collection ID missing!');

    const doc = await DbCollection.findById(id);

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find collection with ID "${id}"!`);

    await doc.updateOne(data);

  }

  public async deleteCollection(id: string): Promise<void> {

    if ( ! id )
      throw new ServerError('invalid-request', 'Collection ID missing!');

    const doc = await DbCollection.findById(id);

    if ( ! doc )
      throw new ServerError('invalid-request', `Could not find collection with ID "${id}"!`);

    await doc.deleteOne();
    await DbItem.deleteMany({ collectionId: id });

  }

  public async getItems(collectionId: string): Promise<IItem[]> {

    if ( ! collectionId )
      throw new ServerError('invalid-request', 'Missing collection ID!');

    const items = await DbItem.find({ collectionId });

    return items.map(i => normalizeCommonDocument(i));

  }
  
  public async createItem(data: IRequestNewItem): Promise<string> {

    const collection = await DbCollection.findById(data.collectionId);
    
    if ( ! collection )
      throw new ServerError('invalid-request', `Could not find collection with ID "${ data.collectionId }"!`);

    const item = new DbItem(data);

    await item.save();

    await collection.updateOne({ size: collection.size + 1 });

    return item._id.toString();

  }

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
      doc.tags.push(...data.tags);

    }

    await doc.save();

  }

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

  public async searchCollections(q: string): Promise<ICollection[]> {

    if ( ! q?.trim().length )
      return this.getCollections();

    const qregex = queryStringToRegex(q);
    const docs = await DbCollection.find({ name: { $regex: qregex.regex, $options: qregex.flags } });

    return docs.map(c => normalizeCommonDocument(c) as ICollection);

  }

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

      query['tags.label'] = { $in: tags.map(t => t.trim()).filter(t => t.length) };

    }

    const docs = await DbItem.find(query);

    return docs.map(i => normalizeCommonDocument(i) as IItem);

  }
  
  public async searchItems(q?: string, tags?: string[]): Promise<IItem[]> {

    if ( ! q?.trim().length && ! tags?.length )
      throw new ServerError('invalid-request', 'No search criteria defined!');

    const query: any = {};

    if ( q?.trim() ) {

      const qregex = queryStringToRegex(q);

      query.title = { $regex: qregex.regex, $options: qregex.flags };

    }

    if ( tags?.length ) {

      query['tags.label'] = { $in: tags.map(t => t.trim()).filter(t => t.length) };

    }

    const docs = await DbItem.find(query);

    return docs.map(i => normalizeCommonDocument(i) as IItem);
    
  }

}