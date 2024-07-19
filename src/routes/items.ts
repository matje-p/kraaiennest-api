import { Router } from 'express';
import Item from '../models/Item';

const router = Router();

// Type guard for error handling
const isError = (err: unknown): err is Error => {
    return (err as Error).message !== undefined;
  };



// Fetch all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err: unknown) {
    if (isError(err)) {
      res.status(500).json({ error: (err as Error).message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});


// Add new item
router.post('/', async (req, res) => {
    console.log('Incoming request body:', req.body); // Log request body
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (err: unknown) {
    if (isError(err)) {
      res.status(500).json({ error: (err as Error).message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Edit item
router.patch('/:id/item', async (req, res) => {
  console.log(`Edit request for item id: ${id}`);
  const { id } = req.params;
  const { item } = req.body;
  
  try {
    const updatedItem = await Item.findOneAndUpdate(
      { id },
      { item },
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(updatedItem);
  } catch (err: unknown) {
    if (isError(err)) {
      console.error('Error editing item:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error('Unknown error editing item');
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});


// Delete item
router.delete('/:id', async (req, res) => {
  console.log(`Delete request for item id: ${req.params.id}`); // Log the request id
  try {
    const deletedItem = await Item.findOneAndDelete({ id: req.params.id }); // Use findOneAndDelete with custom id
    if (!deletedItem) {
      console.error(`Item with id ${req.params.id} not found`);
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err: unknown) {
    if (isError(err)) {
      console.error('Error deleting item:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error('Unknown error deleting item');
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});


// Endpoint to mark item as done
router.patch('/:id/done', async (req, res) => {
  try {
    const updatedItem = await Item.findOneAndUpdate(
      { id: req.params.id },  // Use the custom id field
      { done: req.body.done, dateDone: new Date(), userDone: req.body.userDone },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(updatedItem);
  } catch (err: unknown) {
    if (isError(err)) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});


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

export default router;
