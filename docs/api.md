# Backend API Documentation

> Any of the following endpoints can respond with [Error Response](#error-response) if an error occurs.

### Collection Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **GET** `/api/collections` |  |  |  | Array of [Collection](#collection) objects |
| **POST** `/api/collection` | | | [New Collection Request](#new-collection-request) | [General Message Response](#general-message-response) containing new collection ID |
| **PUT** `/api/collection/:id` | | `id` as collection ID | [Update Collection Request](#update-collection-request) | [General Message Response](#general-message-response) |
| **DELETE** `/api/collection/:id` | | `id` as collection ID | | [General Message Response](#general-message-response) |

### Item Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **GET** `/api/items/:collectionId` | | `collectionId` as collection ID under which items are being read | | Array of [Item](#item) |
| **POST** `/api/item` | | | [New Item Request](#new-item-request) | [General Message Response](#general-message-response) containing new item ID |
| **PUT** `/api/item/:id` | | `id` as item ID | [Update Item Request](#update-item-request) | [General Message Response](#general-message-response) |
| **DELETE** `/api/item/:id` | | `id` as item ID | | [General Message Response](#general-message-response) |

### Search Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **GET** `/api/search/collections` | `q` as search text query | | | Array of [Collection](#collection) |
| **GET** `/api/search/items/:collectionId` | `q` as search text query, `tags` as array of item tags | `collectionId` as collection ID under which items are be searched | | Array of [Item](#item) |
| **GET** `/api/search/items` | `q` as search text query, `tags` as array of item tags | | | Array of [Item](#item) |


# Data Models

### Common

```ts
enum Color {
  Blue,
  Green,
  Red,
  Orange,
  Yellow,
  Magenta,
  White
}
```

```ts
interface CommonDocument {
  id: string,
  updatedAt: number,
  createdAt: number
}
```

```ts
interface Tag {
  label: string,
  color: Color
}
```

### Collection

```ts
interface CollectionDocument extends CommonDocument {
  name: string,
  color: Color,
  size: number
}
```

### Item

```ts
interface ItemDocument extends CommonDocument {
  collectionId: string,
  title: string,
  url: string,
  description?: string,
  posterUrl?: string,
  tags: Tag[]
}
```

---

## Responses

### General Message Response

```ts
interface ResponseGeneralMessage<T=any> {
  message: string,
  data?: T
}
```

### Error Response

```ts
interface ResponseError {
  message: string,
  code: string
}
```

---

## Requests

### New Collection Request

```ts
interface RequestNewCollection {
  name: string,
  color: Color
}
```

### Update Collection Request

```ts
interface RequestUpdateCollection {
  name?: string,
  color?: Color
}
```

### New Item Request

```ts
interface RequestNewItem {
  collectionId: string,
  title: string,
  url: string,
  description?: string,
  posterUrl?: string,
  tags: Tag[]
}
```

### Update Item Request

```ts
interface RequestUpdateItem {
  title?: string,
  url?: string,
  description?: string | null,
  posterUrl?: string | null,
  tags?: Tag[]
}
```