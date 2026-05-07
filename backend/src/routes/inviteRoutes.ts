import { Router } from "express";
import { acceptInvite, previewInvite } from "../controllers/adminInviteController";
import { listPublicSettings } from "../controllers/systemSettingController";

const router: Router = Router();

// Public — invitee previews the invite (email/role/status) before accepting
router.get("/admin-invite/preview/:token", previewInvite);
// Public — invitee accepts via token
router.post("/admin-invite/accept/:token", acceptInvite);

// Public site settings
router.get("/settings/public", listPublicSettings);

export default router;
