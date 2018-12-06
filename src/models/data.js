import mongoose from 'mongoose';

const dataSchema = mongoose.Schema({
	location: String,
	data: String
});

export default mongoose.model('Data', dataSchema);