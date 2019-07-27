"use strict";
/*eslint no-invalid-this:0*/
const crypto = require("crypto");

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const { Schema } = require("mongoose");

const authTypes = ["github", "twitter", "facebook", "google"];

var UserSchema = new Schema({
  name: String,
  profileId: String,
  email: {
    type: String,
    lowercase: true,
    required() {
      if (authTypes.indexOf(this.provider) === -1) {
        return true;
      } else {
        return false;
      }
    }
  },
  role: {
    type: String,
    default: "user"
  },
  password: {
    type: String,
    required() {
      if (authTypes.indexOf(this.provider) === -1) {
        return true;
      } else {
        return false;
      }
    }
  },
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {}
});

/**
 * Virtuals
 */

// Public profile information
UserSchema.virtual("profile").get(function() {
  return {
    name: this.name,
    role: this.role
  };
});

// Non-sensitive info we'll be putting in the token
UserSchema.virtual("token").get(function() {
  return {
    _id: this._id,
    role: this.role
  };
});

/**
 * Validations
 */

// Validate empty email
UserSchema.path("email").validate(function(email) {
  if (authTypes.indexOf(this.provider) !== -1) {
    return true;
  }
  return email.length;
}, "Email cannot be blank");

// Validate empty password
UserSchema.path("password").validate(function(password) {
  if (authTypes.indexOf(this.provider) !== -1) {
    return true;
  }
  return password.length;
}, "Password cannot be blank");

// Validate email is not taken
UserSchema.path("email").validate(function(value) {
  if (authTypes.indexOf(this.provider) !== -1) {
    console.log("here");
    return true;
  }

  return this.constructor
    .findOne({ email: value })
    .exec()
    .then(user => {
      if (user) {
        if (this.id === user.id) {
          return true;
        }
        return false;
      }
      return true;
    })
    .catch(function(err) {
      throw err;
    });
}, "The specified email address is already in use.");

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema.pre("save", function(next) {
  // Handle new/update passwords
  if (!this.isModified("password")) {
    return next();
  }

  if (!validatePresenceOf(this.password)) {
    if (authTypes.indexOf(this.provider) === -1) {
      return next(new Error("Invalid password"));
    } else {
      return next();
    }
  }

  // Make salt with a callback
  this.makeSalt((saltErr, salt) => {
    if (saltErr) {
      return next(saltErr);
    }
    this.salt = salt;
    this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
      if (encryptErr) {
        return next(encryptErr);
      }
      this.password = hashedPassword;
      return next();
    });
  });
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if (err) {
        return callback(err);
      }

      if (this.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(byteSize, callback) {
    var defaultByteSize = 16;

    if (typeof arguments[0] === "function") {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if (typeof arguments[1] === "function") {
      callback = arguments[1];
    } else {
      throw new Error("Missing Callback");
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if (err) {
        return callback(err);
      } else {
        return callback(null, salt.toString("base64"));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if (!password || !this.salt) {
      if (!callback) {
        return null;
      } else {
        return callback("Missing password or salt");
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = new Buffer(this.salt, "base64");

    if (!callback) {
      return crypto
        .pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength)
        .toString("base64");
    }

    return crypto.pbkdf2(
      password,
      salt,
      defaultIterations,
      defaultKeyLength,
      (err, key) => {
        if (err) {
          return callback(err);
        } else {
          return callback(null, key.toString("base64"));
        }
      }
    );
  }
};

module.exports = mongoose.model("Users", UserSchema);
