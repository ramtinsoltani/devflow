import { Schema, model } from 'mongoose';
import { isURL } from 'validator';
import { Color } from './normalized';

const ColorSubSchema = {
  type: Number,
  required: true,
  validate: {
    validator: (v: number) => Object.values(Color).slice(Object.values(Color).length / 2).includes(v),
    message: () => `Invalid color value!`
  }
};

export const CollectionSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 64,
    index: true
  },
  color: ColorSubSchema,
  size: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

export const DbCollection = model('Collection', CollectionSchema);

export const ItemSchema = new Schema({
  collectionId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 128,
    index: true
  },
  url: {
    type: String,
    required: true,
    maxLength: 256,
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
    maxLength: 512
  },
  posterUrl: {
    type: String,
    maxLength: 256,
    validate: {
      validator: (v: string) => isURL(v, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_valid_protocol: true
      }),
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
    },
    index: true
  },
  originTitle: {
    type: String,
    maxLength: 128
  },
  originUrl: {
    type: String,
    maxLength: 256,
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
    maxLength: 256,
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
  }
}, {
  timestamps: true
});

export const DbItem = model('Item', ItemSchema);