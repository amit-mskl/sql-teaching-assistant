// SQL Execution Service for Tony Stark's Workshop
// Provides secure, educational SQL query execution

import sqlite3 from 'sqlite3';

// Create in-memory SQLite database for safe execution
const createWorkshopDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Create sample tables for learning
      const schema = `
        -- Employees table
        CREATE TABLE employees (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          department TEXT NOT NULL,
          salary INTEGER NOT NULL,
          hire_date DATE NOT NULL,
          manager_id INTEGER
        );
        
        -- Departments table
        CREATE TABLE departments (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          budget INTEGER NOT NULL,
          location TEXT NOT NULL
        );
        
        -- Products table
        CREATE TABLE products (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          stock_quantity INTEGER NOT NULL
        );
        
        -- Orders table
        CREATE TABLE orders (
          id INTEGER PRIMARY KEY,
          customer_name TEXT NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          order_date DATE NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (product_id) REFERENCES products(id)
        );
        
        -- Sample employees data
        INSERT INTO employees (name, department, salary, hire_date, manager_id) VALUES
        ('Tony Stark', 'Engineering', 250000, '2008-05-02', NULL),
        ('Pepper Potts', 'Management', 180000, '2008-05-15', 1),
        ('Happy Hogan', 'Security', 75000, '2010-06-01', 2),
        ('Bruce Banner', 'Research', 160000, '2012-05-04', 1),
        ('Natasha Romanoff', 'Security', 95000, '2010-08-15', 2),
        ('Steve Rogers', 'Leadership', 120000, '2011-07-04', 1),
        ('James Rhodes', 'Engineering', 140000, '2008-10-15', 1),
        ('Vision', 'Analysis', 200000, '2015-05-01', 1);
        
        -- Sample departments data
        INSERT INTO departments (name, budget, location) VALUES
        ('Engineering', 5000000, 'Malibu Workshop'),
        ('Management', 2000000, 'Stark Tower'),
        ('Security', 1500000, 'Stark Tower'),
        ('Research', 3000000, 'Avengers Compound'),
        ('Leadership', 1000000, 'Avengers Compound'),
        ('Analysis', 2500000, 'Avengers Compound');
        
        -- Sample products data
        INSERT INTO products (name, category, price, stock_quantity) VALUES
        ('Arc Reactor v1', 'Energy', 50000000.00, 1),
        ('Iron Man Suit Mark 85', 'Defense', 100000000.00, 1),
        ('Repulsor Ray', 'Weapons', 25000000.00, 2),
        ('FRIDAY AI License', 'Software', 10000000.00, 5),
        ('Stark Phone', 'Consumer', 1500.00, 1000),
        ('Holographic Display', 'Technology', 500000.00, 10),
        ('Vibranium Shield', 'Defense', 75000000.00, 1),
        ('Web Shooters', 'Gadgets', 50000.00, 20);
        
        -- Sample orders data
        INSERT INTO orders (customer_name, product_id, quantity, order_date, total_amount) VALUES
        ('S.H.I.E.L.D.', 2, 1, '2023-01-15', 100000000.00),
        ('Avengers Initiative', 4, 3, '2023-02-20', 30000000.00),
        ('Peter Parker', 8, 2, '2023-03-10', 100000.00),
        ('Wakanda', 7, 1, '2023-04-05', 75000000.00),
        ('Daily Bugle', 5, 100, '2023-05-12', 150000.00),
        ('MIT', 6, 5, '2023-06-18', 2500000.00),
        ('Stark Industries', 1, 1, '2023-07-22', 50000000.00),
        ('U.S. Government', 3, 10, '2023-08-30', 250000000.00);
      `;
      
      db.exec(schema, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(db);
      });
    });
  });
};

// Security: Check if query is safe (read-only)
const isSafeQuery = (query) => {
  const upperQuery = query.toUpperCase().trim();
  
  // Block dangerous operations
  const dangerousKeywords = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
    'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'UNION', 'ATTACH', 'DETACH'
  ];
  
  // Check for dangerous keywords
  for (const keyword of dangerousKeywords) {
    if (upperQuery.includes(keyword)) {
      return false;
    }
  }
  
  // Must start with SELECT
  if (!upperQuery.startsWith('SELECT')) {
    return false;
  }
  
  return true;
};

// Execute SQL query safely
export const executeSQL = async (query) => {
  try {
    // Security check
    if (!isSafeQuery(query)) {
      return {
        success: false,
        error: "FRIDAY: Security protocol activated. Only SELECT queries allowed in the workshop.",
        results: null
      };
    }
    
    // Create fresh database for each query (isolated execution)
    const db = await createWorkshopDatabase();
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      db.all(query, [], (err, rows) => {
        const executionTime = Date.now() - startTime;
        
        // Close database
        db.close();
        
        if (err) {
          resolve({
            success: false,
            error: `FRIDAY: SQL Error detected - ${err.message}`,
            results: null
          });
          return;
        }
        
        // Check execution time
        if (executionTime > 5000) {
          resolve({
            success: false,
            error: "FRIDAY: Query timeout. Tony's workshop requires efficient queries.",
            results: null
          });
          return;
        }
        
        resolve({
          success: true,
          results: rows,
          executionTime: executionTime,
          rowCount: rows.length
        });
      });
    });
    
  } catch (error) {
    return {
      success: false,
      error: `FRIDAY: Workshop Error - ${error.message}`,
      results: null
    };
  }
};

// Get available tables and their structures
export const getDatabaseSchema = async () => {
  try {
    const db = await createWorkshopDatabase();
    
    return new Promise((resolve) => {
      db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `, [], (err, tables) => {
        
        if (err) {
          db.close();
          resolve({ error: err.message });
          return;
        }
        
        const schema = {};
        let completed = 0;
        
        if (tables.length === 0) {
          db.close();
          resolve(schema);
          return;
        }
        
        tables.forEach((table) => {
          db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
            if (!err) {
              schema[table.name] = columns.map(col => ({
                name: col.name,
                type: col.type,
                primaryKey: col.pk === 1,
                notNull: col.notnull === 1
              }));
            }
            
            completed++;
            if (completed === tables.length) {
              db.close();
              resolve(schema);
            }
          });
        });
      });
    });
    
  } catch (error) {
    return { error: error.message };
  }
};