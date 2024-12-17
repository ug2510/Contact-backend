import express from "express";
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  getPhnumberById,
  deactivateContactById,
  createContactUser,
  loginController,
  getDeletedContacts
} from "../controller/ContactController.js";

const router = express.Router();

router.route("/").get(getContacts).post(createContact);

router.route("/user").post(createContactUser)

router.route("/login").post(loginController)

router.route("/softDelete").get(getDeletedContacts)

router.route("/phone/:phnumber").patch(updateContact).get(getPhnumberById);

router.route("/deactivate/:phnumber").patch(deactivateContactById);

router.route("/name/:name").get(getContactById);

export default router;
