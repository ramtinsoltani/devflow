import { Document, Types } from "mongoose";

/**
 * Applies general normalization to a Mongoose document and converts it to JSON object.
 * @param doc Mongoose document
 * @returns Normalized JSON object
 */
export function normalizeCommonDocument(doc: any) {

  const normalized: any = {
    id: (doc._id as Types.ObjectId).toString(),
    ...(doc instanceof Document ? doc.toJSON() : doc),
    updatedAt: doc.updatedAt.getTime(),
    createdAt: doc.createdAt.getTime()
  };

  delete normalized.__v;
  delete normalized._id;

  return normalized;

}