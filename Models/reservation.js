const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const revSchema = new Schema({
  carModel: {
    type: String,
    required: true, // Assuming these fields should be required
  },
  plateNumber: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  reservations: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("Reservation", revSchema);
