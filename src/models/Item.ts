import { Date, Schema, model } from 'mongoose';

interface IItem {
  item: string;
  userAdded: string;
  dateAdded: Date;
  userDone: string;
  dateDone: Date;
  done: boolean;
  id: string;
}

const ItemSchema = new Schema<IItem>({
  item: { type: String, required: true },
  userAdded: { type: String, required: true },
  dateAdded: { type: Date, required: true },
  userDone: { type: String, required: false },
  dateDone: { type: Date, required: false },
  done: { type: Boolean, required: true },
  id: { type: String, required: true, unique: true }
});

const Item = model<IItem>('Item', ItemSchema);

export default Item;
