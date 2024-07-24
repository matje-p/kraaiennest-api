import { Date, Schema, model } from 'mongoose';

interface BoodschapProps {
  household: string;
  item: string;
  userAdded: string;
  dateAdded: Date;
  userDone: string;
  dateDone: Date;
  done: boolean;
  userLastChange: string;
  id: string;
}

const BoodschapSchema = new Schema<BoodschapProps>({
  household: { type: String, required: true },
  item: { type: String, required: false },
  userAdded: { type: String, required: true },
  dateAdded: { type: Date, required: true },
  userDone: { type: String, required: false },
  dateDone: { type: Date, required: false },
  done: { type: Boolean, required: true },
  userLastChange: { type: String, required: false },
  id: { type: String, required: true, unique: true }
});

const Boodschap = model<BoodschapProps>('Boodschap', BoodschapSchema);

export default Boodschap;
