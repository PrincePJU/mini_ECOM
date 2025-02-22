const User=require('../../models/user')
const {hashPassword}=require('../../utils/password')

  const handleAddCustomer = async (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password ) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
  
    try {
      // Hash the password before saving
      const hashedPassword = await hashPassword(password);
  
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role:"CUSTOMER",
      });
  
      res.status(201).json({ message: 'Customer added successfully', newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add customer' });
    }
  };
  

  const handleUpdateCustomer = async (req, res) => {
    const { email, name, password } = req.body;
    role="CUSTOMER";
    if (!email || !name || !password || !role) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
  
    if (role !== 'CUSTOMER') {
      return res.status(400).json({ error: 'Role must be CUSTOMER' });
    }
  
    try {
      const hashedPassword = await hashPassword(password);
  
      // Update customer by email
      const user = await User.findOneAndUpdate(
        { email, role: 'CUSTOMER' }, // Ensure it's a customer
        { name, password: hashedPassword, role },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ error: 'Customer not found or not a CUSTOMER' });
      }
  
      res.status(200).json({ message: 'Customer updated successfully', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update customer' });
    }
  };
  
  const handleDeleteCustomer = async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to delete customer' });
    }
  
    try {
      // Find the user with the specified email and role "CUSTOMER"
      const user = await User.findOne({ email, role: 'CUSTOMER' });
  
      if (!user) {
        return res.status(404).json({ error: 'Customer not found or not a CUSTOMER' });
      }
  
      // Set isDeleted to true instead of deleting the customer
      user.isDeleted = true;
      await user.save();
  
      res.status(200).json({ message: 'Customer marked as deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to mark customer as deleted' });
    }
  };
  
  

const handleGetAllCustomers = async (req, res) => {
  try {
    // Find all users with the role "CUSTOMER"
    const customers = await User.find({ role: 'CUSTOMER',isDeleted:false });

    if (customers.length === 0) {
      return res.status(404).json({ error: 'No customers found' });
    }

    // Return the list of customers
    res.status(200).json({ message: 'Customers retrieved successfully', customers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};





module.exports={handleAddCustomer,handleDeleteCustomer,handleGetAllCustomers,handleUpdateCustomer}