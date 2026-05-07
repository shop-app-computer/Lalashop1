import { Request, Response } from "express";
import Address from "../models/addressModel";

// @desc    Add new address
// @route   POST /api/address
// @access  Private
export const addAddress = async (req: any, res: Response) => {
  const { recipientName, phoneNumber, village, district, province, shippingBranch, isDefault } = req.body;

  try {
    // If this is the first address, make it default anyway
    const addressCount = await Address.countDocuments({ user: req.user._id });
    
    // If setting as default, unset other defaults
    if (isDefault || addressCount === 0) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      recipientName,
      phoneNumber,
      village,
      district,
      province,
      shippingBranch,
      isDefault: addressCount === 0 ? true : isDefault,
    });

    res.status(201).json(address);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's default address
// @route   GET /api/address/me
// @access  Private
export const getMyAddress = async (req: any, res: Response) => {
  try {
    // Try to find default address first
    let address = await Address.findOne({ user: req.user._id, isDefault: true });
    
    // If no default, find any address
    if (!address) {
      address = await Address.findOne({ user: req.user._id });
    }

    if (address) {
      res.json(address);
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user's addresses
// @route   GET /api/address/all
// @access  Private
export const getAllAddresses = async (req: any, res: Response) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/address/:id
// @access  Private
export const updateAddress = async (req: any, res: Response) => {
  try {
    const { isDefault } = req.body;
    
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(address);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/address/:id
// @access  Private
export const deleteAddress = async (req: any, res: Response) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If we deleted the default address, set another one as default if exists
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({ message: "Address removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set default address
// @route   PATCH /api/address/:id/default
// @access  Private
export const setDefaultAddress = async (req: any, res: Response) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(address);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
