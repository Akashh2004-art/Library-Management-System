const Member = require('../models/memberModel');

// Get all members
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new member
exports.addMember = async (req, res) => {
  const { name, email, membershipDate } = req.body;

  const newMember = new Member({ name, email, membershipDate });

  try {
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
