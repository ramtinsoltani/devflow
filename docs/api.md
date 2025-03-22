# Backend API Documentation

> Any of the following endpoints can respond with [Error Response](#error-response) if an error occurs.

### Space Endpoint

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **GET** `/api/spaces` |  |  |  | Array of [Space](#space) objects |
| **POST** `/api/space` | | | [New Space Request](#new-space-request) | [General Message Response](#general-message-response) containing new space ID |
| **PUT** `/api/space/:id` | | `id` as space ID | [Update Space Request](#update-space-request) | [General Message Response](#general-message-response) |
| **DELETE** `/api/space/:id` | | `id` as space ID | | [General Message Response](#general-message-response) |

### Collection Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **GET** `/api/:spaceId/collections` |  | `spaceId` as space Id  |  | Array of [Collection](#collection) objects |
| **POST** `/api/:spaceId/collection` | | `spaceId` as space Id | [New Collection Request](#new-collection-request) | [General Message Response](#general-message-response) containing new collection ID |
| **PUT** `/api/:spaceId/collection/:id` | | `spaceId` as space Id, `id` as collection ID | [Update Collection Request](#update-collection-request) | [General Message Response](#general-message-response) |
| **DELETE** `/api/:spaceId/collection/:id` | | `spaceId` as space Id, `id` as collection ID | | [General Message Response](#general-message-response) |

### Item Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **GET** `/api/:spaceId/item/:id` | | `spaceId` as space ID, `id` as item ID | | [Item](#item) |
| **GET** `/api/:spaceId/items/:collectionId` | | `spaceId` as space ID, `collectionId` as collection ID under which items are being read | | Array of [Item](#item) |
| **POST** `/api/:spaceId/item` | | `spaceId` as space ID | [New Item Request](#new-item-request) | [General Message Response](#general-message-response) containing new item ID |
| **PUT** `/api/:spaceId/item/:id` | | `spaceId` as space ID, `id` as item ID | [Update Item Request](#update-item-request) | [General Message Response](#general-message-response) |
| **DELETE** `/api/:spaceId/item/:id` | | `spaceId` as space ID, `id` as item ID | | [General Message Response](#general-message-response) |

### Search Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **GET** `/api/:spaceId/:collectionId/search/items` | `q` as search text query, `tags` as array of item tags | `spaceId` as space ID, `collectionId` as collection ID under which items are be searched | | Array of [Item](#item) |
| **GET** `/api/:spaceId/search/items` | `q` as search text query, `tags` as array of item tags | `spaceId` as space ID | | Array of [Item](#item) |

### Permission Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **GET** `/api/permissions/provisioned/:spaceId` | | `spaceId` as space ID | | Array of [Permission](#permission) provisioned by the authenticated user for the space |
| **GET** `/api/permissions/granted` | | | | Array of [Permission](#permission) granted to the authenticated user |
| **POST** `/api/permissions/provision` | | | [New Permission Request](#new-permission-request) | [General Message Response](#general-message-response) indicating the new permission has been provisioned by the authenticated user for another user |
| **PUT** `/api/permissions/:id/accept` | | `id` as permission ID | | [General Message Response](#general-message-response) indicating the permission has been accepted by the authenticated user as the grantee |
| **DELETE** `/api/permissions/:id/revoke` | | `id` as permission ID | | [General Message Response](#general-message-response) indicating the permission has been revoked by the authenticated user as the owner |
| **DELETE** `/api/permissions/:id/self-revoke` | | `id` as permission ID | | [General Message Response](#general-message-response) indicating the permission has been self-revoked by the authenticated user as the grantee |

### Tags Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **GET** `/api/tags/:spaceId/color/:label` | `exclude` as single item ID to exclude reading tags from | `spaceId` as space ID, `label` as tag label | | [Color Response](#color-response) holding the color of the tag, or `null` if tag does not exist |

### Utility Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **POST** `/api/utils/metadata` | | | [Fetch URL Metadata Request](#fetch-url-metadata-request) | [URL Metadata](#url-metadata-response) |

### Reorder Endpoints

| Endpoint | Query Params | Route Params | Body | Response |
|:---------|:------------:|:------------:|:----:|:--------:|
| **PATCH** `/api/reorder/:spaceId` | | `spaceId` as space ID | [Reorder Request](#reorder-request) | Reorders an owned space (excluding shared spaces). |
| **PATCH** `/api/reorder/:spaceId/:collectionId` | | `spaceId` as space ID, `collectionId` as collection ID | [Reorder Request](#reorder-request) | Reorders a collection. |
| **PATCH** `/api/reorder/:spaceId/:collectionId/:itemId` | | `spaceId` as space ID, `collectionId` as collection ID, `itemId` as item ID | [Reorder Request](#reorder-request) | Reorders an item. |

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
  owner: string,
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

### Space

```ts
interface SpaceDocument extends CommonDocument {
  name: string
}
```

### Collection

```ts
interface CollectionDocument extends CommonDocument {
  spaceId: string,
  name: string,
  color: Color,
  size: number
}
```

### Item

```ts
interface ItemDocument extends CommonDocument {
  spaceId: string,
  collectionId: string,
  title: string,
  url: string,
  description?: string,
  posterUrl?: string,
  tags: Tag[]
}
```

### Permission

```ts
interface PermissionDocument extends CommonDocument {
  spaceId: string,
  grantedTo: string,
  permission: 'read' | 'write',
  accepted?: boolean
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

### URL Metadata Response

```ts
interface URLMetadataResponse {
  title?: string,
  description?: string,
  posterUrl?: string
}
```

### Color Response

```ts
interface ColorResponse {
  color: Color | null
}
```

---

## Requests

### New Space Request

```ts
interface RequestNewSpace {
  name: string
}
```

### New Collection Request

```ts
interface RequestNewCollection {
  name: string,
  color: Color
}
```

### Update Space Request

```ts
interface RequestUpdateSpace {
  name: string
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

### Reorder Request

```ts
interface ReorderRequest {
  before: string | null,
  after: string | null
}
```

### New Permission Request

```ts
interface RequestNewPermission {
  spaceId: string,
  grantedTo: string,
  permission: 'read' | 'write'
}
```

### Fetch URL Metadata Request

```ts
interface RequestFetchURLMetadata {
  url: string
}
```