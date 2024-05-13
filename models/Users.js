const { Schema } = require("mongoose");
const mongoose = require("mongoose");

mongoose.model("User", {
  id: {
    type: Schema.Types.UUID,
    required: true,
  },
  userName: {
    type: "string",
  },
  accountNumber: {
    type: "number",
  },
  emailAddress: {
    type: "string",
  },
  identityNumber: {
    type: "number",
  },
});
