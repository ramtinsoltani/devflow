import { Schema, model } from 'mongoose';
import { isDataURI, isURL } from 'validator';
import { Color, Permission } from './normalized';

const ColorSubSchema = {
  type: Number,
  required: true,
  validate: {
    validator: (v: number) => Object.values(Color).slice(Object.values(Color).length / 2).includes(v),
    message: () => `Invalid color value!`
  }
};

export const SpaceSchema = new Schema({
  owner: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    maxLength: 64
  },
  order: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

// Compound indexing
SpaceSchema.index({ _id: 1, owner: 1 });

export const DbSpace = model('Space', SpaceSchema);

export const CollectionSchema = new Schema({
  owner: {
    type: String,
    required: true
  },
  spaceId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    maxLength: 64
  },
  color: ColorSubSchema,
  size: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  order: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

// Compound indexing
CollectionSchema.index({ spaceId: 1, owner: 1 });
CollectionSchema.index({ _id: 1, spaceId: 1 });

export const DbCollection = model('Collection', CollectionSchema);

export const ItemSchema = new Schema({
  owner: {
    type: String,
    required: true
  },
  spaceId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  collectionId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 256
  },
  url: {
    type: String,
    required: true,
    maxLength: 1024,
    validate: {
      validator: (v: string) => isURL(v, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_valid_protocol: true
      }),
      message: () => 'Item URL is not a valid URL!'
    }
  },
  description: {
    type: String,
    maxLength: 1024
  },
  posterUrl: {
    type: String,
    maxLength: 1024,
    validate: {
      validator: (v: string) => isURL(v, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_valid_protocol: true
      }) || isDataURI(v),
      message: () => 'Poster URL is not a valid URL!'
    }
  },
  tags: {
    type: [{
      _id: false,
      label: {
        type: String,
        required: true,
        minLength: 1
      },
      color: ColorSubSchema
    }],
    default: [],
    validate: {
      validator: (v: string[]) => v.length <= 20 && v.join().length <= 1000,
      message: () => `Tags exceed the maximum allowed size!`
    }
  },
  originTitle: {
    type: String,
    maxLength: 256
  },
  originUrl: {
    type: String,
    maxLength: 1024,
    validate: {
      validator: (v: string) => isURL(v, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_valid_protocol: true
      }),
      message: () => 'Origin URL is not a valid URL!'
    }
  },
  favicon: {
    type: String,
    maxLength: 1024,
    validate: {
      validator: (v: string) => isURL(v, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_valid_protocol: true
      }),
      message: () => 'Favicon is not a valid URL!'
    }
  },
  forceAltLayout: {
    type: Boolean,
    required: true,
    default: false
  },
  order: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

// Compound indexing
ItemSchema.index({ spaceId: 1, owner: 1 });
ItemSchema.index({ _id: 1, spaceId: 1 });
ItemSchema.index({ spaceId: 1, collectionId: 1 });
ItemSchema.index({ spaceId: 1, collectionId: 1, title: 1 });
ItemSchema.index({ spaceId: 1, collectionId: 1, 'tags.label': 1 });
ItemSchema.index({ spaceId: 1, collectionId: 1, title: 1, 'tags.label': 1 });
ItemSchema.index({ spaceId: 1, title: 1 });
ItemSchema.index({ spaceId: 1, 'tags.label': 1 });
ItemSchema.index({ spaceId: 1, 'tags.label': 1, _id: 1 });
ItemSchema.index({ spaceId: 1, title: 1, 'tags.label': 1 });

export const DbItem = model('Item', ItemSchema);

export const PermissionSchema = new Schema({
  owner: {
    type: String,
    required: true
  },
  spaceId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  spaceName: {
    type: String,
    required: true
  },
  grantedTo: {
    type: String,
    required: true,
    index: true
  },
  granteeName: {
    type: String,
    required: false
  },
  granteeEmail: {
    type: String,
    required: true
  },
  provisionerName: {
    type: String,
    required: false
  },
  provisionerEmail: {
    type: String,
    required: true
  },
  permission: {
    type: String,
    required: true,
    enum: [Permission.ReadOnly, Permission.CanModifyContent],
    default: Permission.ReadOnly
  },
  accepted: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes
PermissionSchema.index({ owner: 1, spaceId: 1 });
PermissionSchema.index({ _id: 1, owner: 1 });
PermissionSchema.index({ _id: 1, grantedTo: 1 });
PermissionSchema.index({ grantedTo: 1, accepted: 1 });
PermissionSchema.index({ owner: 1, grantedTo: 1, spaceId: 1 });
PermissionSchema.index({ grantedTo: 1, spaceId: 1 });

export const DbPermission = model('Permission', PermissionSchema);