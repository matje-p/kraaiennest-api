"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ItemSchema = new mongoose_1.Schema({
    item: { type: String, required: true },
    userAdded: { type: String, required: true },
    dateAdded: { type: Date, required: true },
    userDone: { type: String, required: false },
    dateDone: { type: Date, required: false },
    done: { type: Boolean, required: true },
    id: { type: String, required: true, unique: true }
});
const Item = (0, mongoose_1.model)('Item', ItemSchema);
exports.default = Item;
