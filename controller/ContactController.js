import asyncHandler from "express-async-handler";
import validator from "validator";
import { globalUsername, globalAddress, globalPhnumber } from '../database.js';
import {
  getAllContacts,
  getAllDeletedContacts,
  getContactByPhone,
  InsertNew,
  DeactivateContactById,
  updateContactByPhone,
  getContactByPhoneNo,
  InsertNewUser,
  loginUser,
} from "../database.js";

export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await getAllContacts();
  res.status(200).json(contacts);
});

export const getDeletedContacts = asyncHandler(async (req, res) => {
  const contacts = await getAllDeletedContacts();
  res.status(200).json(contacts);
});

export const getContactById = asyncHandler(async (req, res) => {
  const name = req.params.name;
  const contact = await getContactByPhone(name);
  console.log(contact);

  if (!contact || contact.length === 0) {
    res.status(404);
    throw new Error(`Contact with name ${name} not found.`);
  }

  res.status(200).json(contact);
});

export const getPhnumberById = asyncHandler(async (req, res) => {
  const phnumber = req.params.phnumber;
  const contact = await getContactByPhoneNo(phnumber);

  if (!contact || contact.length === 0) {
    res.status(404);
    throw new Error(`Contact with phone number ${phnumber} not found.`);
  }

  res.status(200).json(contact);
});

export const createContact = asyncHandler(async (req, res) => {
  const { name, email, phnumber } = req.body;

  if (!name || !email || !phnumber) {
    res.status(400);
    throw new Error("Missing required fields: name, email, and phnumber.");
  }

  if (!/^\d+$/.test(phnumber) || phnumber.length !== 10) {
    res.status(400);
    throw new Error("Phone number must be a valid 10-digit integer.");
  }

  if (!/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(name.trim())) {
    res.status(400);
    throw new Error("Name must only contain letters and should not be empty or just spaces.");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Invalid email format.");
  }

  const result = await InsertNew(name, email, phnumber);

  if (result && result.rowsAffected && result.rowsAffected[0] > 0) {
    res.status(201).json({
      success: true,
      message: "Contact added successfully.",
      contact: { name, email, phnumber },
    });
  } else {
    res.status(500);
    throw new Error("Failed to insert the contact into the database.");
  }
});

export const createContactUser = asyncHandler(async (req, res) => {
  const { name, email, phnumber, address, password } = req.body;

  if (!name || !email || !phnumber || !address) {
    res.status(400);
    throw new Error(
      "Missing required fields: name, email, phnumber, and address."
    );
  }
  if (!/^\d+$/.test(phnumber) || phnumber.length !== 10) {
    res.status(400);
    throw new Error("Phone number must be a valid 10-digit integer.");
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    res.status(400);
    throw new Error("Name must only contain letters and spaces.");
  }
  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Invalid email format.");
  }

  const result = await InsertNewUser(name, email, phnumber, address, password);

  if (result && result.rowsAffected && result.rowsAffected[0] > 0) {
    res.status(201).json({
      success: true,
      message: "Contact added successfully.",
      contact: { name, email, phnumber, address },
    });
  } else {
    res.status(500);
    throw new Error("Failed to insert the contact into the database.");
  }
});

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Missing required fields: email and password.");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Invalid email format.");
  }

  try {
    const { token } = await loginUser(email, password);

    if (token) {
      res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        username: globalUsername, 
        phone_number: globalPhnumber,
        address: globalAddress
      });
    } else {
      res.status(401);
      throw new Error("Invalid credentials.");
    }
  } catch (err) {
    res.status(401);
    throw new Error(err.message || "Login failed.");
  }
});

export const deactivateContactById = asyncHandler(async (req, res) => {
  const phnumber = req.params.phnumber;
  const result = await DeactivateContactById(phnumber);

  if (result && result.rowsAffected[0] > 0) {
    res.status(200).json({ message: "Contact deleted successfully." });
  } else {
    res.status(404).json({ message: "Contact not found." });
  }
});

export const updateContact = asyncHandler(async (req, res) => {
  const { phnumber: oldPhone } = req.params;
  const { name, email, phnumber: newPhone } = req.body;

  const existingContact = await getContactByPhoneNo(oldPhone);

  if (!existingContact || existingContact.length === 0) {
    res.status(404);
    throw new Error(`Contact with phone number ${oldPhone} not found.`);
  }

  if (newPhone && newPhone !== oldPhone) {
    const phoneExists = await getContactByPhoneNo(newPhone);
    if (phoneExists && phoneExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Phone number ${newPhone} is already in use.`,
      });
    }
  }

  if (!name && !email && !newPhone) {
    return res.status(400).json({
      success: false,
      message:
        "At least one field (name, email, or phone number) must be provided for the update.",
    });
  }

  if (!/^\d+$/.test(newPhone) || newPhone.length !== 10) {
    res.status(400);
    throw new Error("Phone number must be a valid 10-digit integer.");
  }

  if (!/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(name.trim())) {
    res.status(400);
    throw new Error("Name must only contain letters and should not be empty or just spaces.");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Invalid email format.");
  }

  const updatedName = name || existingContact[0].name;
  const updatedEmail = email || existingContact[0].email;
  const updatedPhone = newPhone || existingContact[0].phnumber;

  const result = await updateContactByPhone(
    oldPhone,
    updatedName,
    updatedEmail,
    updatedPhone
  );

  if (result && result.rowsAffected[0] > 0) {
    res.status(200).json({
      success: true,
      message: "Contact updated successfully.",
      contact: {
        phnumber: updatedPhone,
        name: updatedName,
        email: updatedEmail,
      },
    });
  } else {
    res.status(500);
    throw new Error("Failed to update the contact in the database.");
  }
});
