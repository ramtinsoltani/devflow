import { NextFunction, Response, Router } from "express";
import { protectedRoute } from "../lib/middleware/auth";
import { asyncHandler } from "../lib/middleware/async-handler";
import { AcceptPermissionRequest, AuthorizedRequest, GetProvisionedPermissionsRequest, NewPermissionRequest, RevokePermissionRequest, SelfRevokePermissionRequest } from "../models/requests";
import { IPermission } from "../models/normalized";
import { IResponseGeneralMessage } from "../models/responses";
import { ValidatorSchema } from "../services/validator";

export const PermissionsRouter = Router();

// Make all routes protected
PermissionsRouter.use(protectedRoute);

PermissionsRouter.get('/permissions/provisioned/:spaceId', asyncHandler(async (req: GetProvisionedPermissionsRequest, res: Response<IPermission[]>, next: NextFunction) => {

  const permissions = await services.db.getProvisionedPermissions(req.token, req.params.spaceId);

  res.json(permissions);

}));

PermissionsRouter.get('/permissions/pending', asyncHandler(async (req: AuthorizedRequest, res: Response<IPermission[]>, next: NextFunction) => {

  const permissions = await services.db.getPendingPermissions(req.token);

  res.json(permissions);

}));

PermissionsRouter.post('/permissions/provision', asyncHandler(async (req: NewPermissionRequest, res: Response<IResponseGeneralMessage>, next: NextFunction) => {

  services.validator.validate(req.body, ValidatorSchema.RequestNewPermission);

  await services.db.provisionNewPermission(req.token, req.body);

  res.json({
    message: 'Permission successfully provisioned'
  });

}));

PermissionsRouter.put('/permissions/:id/accept', asyncHandler(async (req: AcceptPermissionRequest, res: Response<IResponseGeneralMessage>, next: NextFunction) => {

  await services.db.acceptPermission(req.token, req.params.id);

  res.json({
    message: 'Permission successfully accepted'
  });

}));

PermissionsRouter.delete('/permissions/:id/revoke', asyncHandler(async (req: RevokePermissionRequest, res: Response<IResponseGeneralMessage>, next: NextFunction) => {

  await services.db.revokePermission(req.token, req.params.id);

  res.json({
    message: 'Permission successfully revoked'
  });

}));

PermissionsRouter.delete('/permissions/:id/self-revoke', asyncHandler(async (req: SelfRevokePermissionRequest, res: Response<IResponseGeneralMessage>, next: NextFunction) => {

  await services.db.selfRevokePermission(req.token, req.params.id);

  res.json({
    message: 'Permission successfully self-revoked'
  });

}));