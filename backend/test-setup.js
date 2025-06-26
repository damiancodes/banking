const { initializeDatabase } = require('./src/config/database');
const Account = require('./src/models/Account');
const Transaction = require('./src/models/Transaction');

async function testSetup() {
  try {
    console.log('Testing database setup...');
    
    // Initialize database
    await initializeDatabase();
    console.log('✓ Database initialized');
    
    // Test account operations
    const accounts = await Account.findAll();
    console.log(`✓ Found ${accounts.length} accounts`);
    
    // Test getting specific account
    const testAccount = await Account.findByName('Bank_USD_1');
    console.log(`✓ Test account balance: ${testAccount ? testAccount.balance : 'Not found'}`);
    
    // Test transaction retrieval
    const transactions = await Transaction.findAll({ limit: 5 });
    console.log(`✓ Found ${transactions.length} transactions`);
    
    console.log('\n✅ Backend setup test completed successfully!');
    console.log('\nTo start the server, run:');
    console.log('  cd backend');
    console.log('  npm start');
    
  } catch (error) {
    console.error('❌ Setup test failed:', error.message);
  }
}

testSetup();
