const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const precinctRoutes = require('./routes/precinctRoutes');
const dunRoutes = require('./routes/dunRoutes');
const parliamentRoutes = require('./routes/parliamentRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoleRoutes = require('./routes/userRoleRoutes');
const userCategoryRoutes = require('./routes/userCategoryRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');
const couponRoutes = require('./routes/couponRoutes');
const scannedImageRoutes = require('./routes/scannedImageRoutes');
const startaRoutes = require('./routes/strataRoutes'); 
const pickupRoutes = require('./routes/pickupRoutes');
const recyclerCompanyRoutes = require('./routes/recyclerRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const esgRoutes = require('./routes/esgReportRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/precincts', precinctRoutes);
app.use('/api/duns', dunRoutes);
app.use('/api/parliaments', parliamentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/user-roles', userRoleRoutes);
app.use('/api/user-categories', userCategoryRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/scanned-images', scannedImageRoutes);
app.use('/api/stratas', startaRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/recycler-companies', recyclerCompanyRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/esgreports', esgRoutes);

app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
