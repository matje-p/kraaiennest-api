import { Schema, model } from 'mongoose';

export interface HouseholdProps {
  fullname: string;
  name: string;
  id: number;
}

const HouseholdSchema = new Schema<HouseholdProps>({
  fullname: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: Number, required: true, unique: true }
});

const Household = model<HouseholdProps>('Household', HouseholdSchema);

export default Household;