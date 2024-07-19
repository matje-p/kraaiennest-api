"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Item_1 = __importDefault(require("../models/Item"));
const router = (0, express_1.Router)();
// Type guard for error handling
const isError = (err) => {
    return err.message !== undefined;
};
// Fetch all items
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield Item_1.default.find();
        res.json(items);
    }
    catch (err) {
        if (isError(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// Add new item
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Incoming request body:', req.body); // Log request body
    try {
        const newItem = new Item_1.default(req.body);
        const savedItem = yield newItem.save();
        res.json(savedItem);
    }
    catch (err) {
        if (isError(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// Edit item
router.patch('/:id/item', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { item } = req.body;
    console.log(`Edit request for item id: ${id}`);
    try {
        const updatedItem = yield Item_1.default.findOneAndUpdate({ id }, { item }, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(updatedItem);
    }
    catch (err) {
        if (isError(err)) {
            console.error('Error editing item:', err.message);
            res.status(500).json({ error: err.message });
        }
        else {
            console.error('Unknown error editing item');
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// Delete item
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Delete request for item id: ${req.params.id}`); // Log the request id
    try {
        const deletedItem = yield Item_1.default.findOneAndDelete({ id: req.params.id }); // Use findOneAndDelete with custom id
        if (!deletedItem) {
            console.error(`Item with id ${req.params.id} not found`);
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    }
    catch (err) {
        if (isError(err)) {
            console.error('Error deleting item:', err.message);
            res.status(500).json({ error: err.message });
        }
        else {
            console.error('Unknown error deleting item');
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// Endpoint to mark item as done
router.patch('/:id/done', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedItem = yield Item_1.default.findOneAndUpdate({ id: req.params.id }, // Use the custom id field
        { done: req.body.done, dateDone: new Date(), userDone: req.body.userDone }, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(updatedItem);
    }
    catch (err) {
        if (isError(err)) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// // Undo boodschappen
// router.post('/undo', async (req, res) => {
//   const { prevBoodschappen } = req.body;
//   try {
//     await Item.deleteMany({});
//     const addedItems = await Item.insertMany(prevBoodschappen);
//     res.json({ message: 'Current state deleted' });
//   } catch (err: unknown) {
//     if (isError(err)) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });
exports.default = router;
