const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String, 
    required: true,
    enum: ['C.S.T', 'E.E', 'E.T.C.E']  // Ekhane full form er bodole abbreviated form
  },
  regNo: { 
    type: String,
    default: undefined,  // Changed from null to undefined
    unique: true,
    sparse: true
  },
  semester: { 
    type: String,
    default: undefined  // Changed from null to undefined
  },
  lastSemesterUpdateDate: { 
    type: Date,
    default: undefined  // Changed from null to undefined
  },
  resetPasswordOTP: String,
  resetPasswordOTPExpiry: Date
}, {
  timestamps: true  // This will add createdAt and updatedAt fields
});

// // Add a pre-save middleware to ensure department is in full form
// userSchema.pre('save', function(next) {
//   const departmentMapping = {
//     'C.S.T': 'Computer Science and Technology',
//     'E.E': 'Electrical Engineering',
//     'E.T.C.E': 'Electronics and Telecommunication Engineering'
//   };

//   if (this.department && departmentMapping[this.department]) {
//     this.department = departmentMapping[this.department];
//   }

//   // Convert null values to undefined
//   if (this.regNo === null) this.regNo = undefined;
//   if (this.semester === null) this.semester = undefined;
//   if (this.lastSemesterUpdateDate === null) this.lastSemesterUpdateDate = undefined;
  
//   next();
// });

const User = mongoose.model('User', userSchema);

module.exports = User;