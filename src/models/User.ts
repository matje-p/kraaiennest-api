import { Schema, model } from 'mongoose';

export interface UserProps {
  name: string;
  households: string[];
}

const UserSchema = new Schema<UserProps>({
  name: { type: String, required: true },
});

const User = model<UserProps>('User', UserSchema);

export default User;