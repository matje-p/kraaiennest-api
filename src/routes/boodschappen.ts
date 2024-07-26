import { Router } from 'express';
import Boodschap from '../models/Boodschap';

const router = Router();

// Type guard for error handling
const isError = (err: unknown): err is Error => {
    return (err as Error).message !== undefined;
  };


// Fetch all boodschappen or filter by household
router.get('/:householdName', async (req, res) => {
  const { householdName } = req.params;

  try {
    const boodschappen = await Boodschap.find({ householdName });
    res.json(boodschappen);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});


// Add new Boodschap
router.post('/', async (req, res) => {
    console.log('Incoming request body:', req.body); // Log request body
  try {
    const newBoodschap = new Boodschap(req.body);
    const savedBoodschap = await newBoodschap.save();
    res.json(savedBoodschap);
  } catch (err: unknown) {
    if (isError(err)) {
      res.status(500).json({ error: (err as Error).message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Edit boodschap
router.patch('/:id', async (req, res) => {
  
  const { id } = req.params;
  const { item, userLastChange } = req.body;  // Destructure userLastChange from req.body
  console.log(`Edit request for boodschap id: ${id}`);

  try {
    const updatedBoodschap = await Boodschap.findOneAndUpdate(
      { id },
      { item, userLastChange },  // Update both item and userLastChange
      { new: true }
    );
    
    if (!updatedBoodschap) {
      return res.status(404).json({ message: 'Boodschap not found' });
    }

    res.json(updatedBoodschap);
  } catch (err: unknown) {
    if (isError(err)) {
      console.error('Error editing boodschap:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error('Unknown error editing boodschap');
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});


// Delete boodschap
router.delete('/:id', async (req, res) => {
  console.log(`Delete request for boodschap id: ${req.params.id}`); // Log the request id
  try {
    const deletedBoodschap = await Boodschap.findOneAndDelete({ id: req.params.id }); // Use findOneAndDelete with custom id
    if (!deletedBoodschap) {
      console.error(`Boodschap with id ${req.params.id} not found`);
      return res.status(404).json({ message: 'Boodschap not found' });
    }
    res.json({ message: 'Boodschap deleted successfully' });
  } catch (err: unknown) {
    if (isError(err)) {
      console.error('Error deleting boodschap:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error('Unknown error deleting boodschap');
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Endpoint to mark boodschap as done
router.patch('/:id/done', async (req, res) => {
  try {
    const updatedBoodschap = await Boodschap.findOneAndUpdate(
      { id: req.params.id },  // Use the custom id field
      { done: req.body.done, dateDone: new Date(), userDone: req.body.userDone },
      { new: true }
    );
    if (!updatedBoodschap) {
      return res.status(404).json({ message: 'Boodschap not found' });
    }
    res.json(updatedBoodschap);
  } catch (err: unknown) {
    if (isError(err)) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Upsert boodschap
router.put('/:id', async (req, res) => {
  console.log(`Put request for boodschap id: ${req.params.id}`); // Log the request id
  try {
    const boodschap = await Boodschap.findOneAndUpdate(
      { id: req.params.id }, // Use the custom id field
      req.body, // Update with request body
      { new: true, upsert: true } // Return the updated document, create if not found
    );
    res.json(boodschap);
  } catch (err: unknown) {
    if (isError(err)) {
      console.error('Error upserting boodschap:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error('Unknown error upserting boodschap');
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});


export default router;
