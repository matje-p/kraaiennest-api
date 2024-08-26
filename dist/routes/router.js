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
const Boodschap_1 = __importDefault(require("../models/Boodschap"));
const Household_1 = __importDefault(require("../models/Household"));
const router = (0, express_1.Router)();
// Type guard for error handling
const isError = (err) => {
    return err.message !== undefined;
};
router.get('/households', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const households = yield Household_1.default.find();
        res.json(households);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// Fetch all boodschappen or filter by household
router.get('/boodschappen/:householdName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { householdName } = req.params;
    try {
        const boodschappen = yield Boodschap_1.default.find({ householdName });
        res.json(boodschappen);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// Add new Boodschap
router.post('/boodschappen/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Incoming request body:', req.body); // Log request body
    try {
        const newBoodschap = new Boodschap_1.default(req.body);
        const savedBoodschap = yield newBoodschap.save();
        res.json(savedBoodschap);
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
// Edit boodschap
router.patch('/boodschappen/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { item, userLastChange } = req.body; // Destructure userLastChange from req.body
    console.log(`Edit request for boodschap id: ${id}`);
    try {
        const updatedBoodschap = yield Boodschap_1.default.findOneAndUpdate({ id }, { item, userLastChange }, // Update both item and userLastChange
        { new: true });
        if (!updatedBoodschap) {
            return res.status(404).json({ message: 'Boodschap not found' });
        }
        res.json(updatedBoodschap);
    }
    catch (err) {
        if (isError(err)) {
            console.error('Error editing boodschap:', err.message);
            res.status(500).json({ error: err.message });
        }
        else {
            console.error('Unknown error editing boodschap');
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// Delete boodschap
router.delete('/boodschappen/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Delete request for boodschap id: ${req.params.id}`); // Log the request id
    try {
        const deletedBoodschap = yield Boodschap_1.default.findOneAndDelete({ id: req.params.id }); // Use findOneAndDelete with custom id
        if (!deletedBoodschap) {
            console.error(`Boodschap with id ${req.params.id} not found`);
            return res.status(404).json({ message: 'Boodschap not found' });
        }
        res.json({ message: 'Boodschap deleted successfully' });
    }
    catch (err) {
        if (isError(err)) {
            console.error('Error deleting boodschap:', err.message);
            res.status(500).json({ error: err.message });
        }
        else {
            console.error('Unknown error deleting boodschap');
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
// Endpoint to mark boodschap as done
router.patch('/boodschappen/:id/done', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedBoodschap = yield Boodschap_1.default.findOneAndUpdate({ id: req.params.id }, // Use the custom id field
        { done: req.body.done, dateDone: new Date(), userDone: req.body.userDone }, { new: true });
        if (!updatedBoodschap) {
            return res.status(404).json({ message: 'Boodschap not found' });
        }
        res.json(updatedBoodschap);
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
// Upsert boodschap
router.put('/boodschappen/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Put request for boodschap id: ${req.params.id}`); // Log the request id
    try {
        const boodschap = yield Boodschap_1.default.findOneAndUpdate({ id: req.params.id }, // Use the custom id field
        req.body, // Update with request body
        { new: true, upsert: true } // Return the updated document, create if not found
        );
        res.json(boodschap);
    }
    catch (err) {
        if (isError(err)) {
            console.error('Error upserting boodschap:', err.message);
            res.status(500).json({ error: err.message });
        }
        else {
            console.error('Unknown error upserting boodschap');
            res.status(500).json({ error: 'Unknown error' });
        }
    }
}));
exports.default = router;
