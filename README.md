# bamazon

Amazon-like storefront with NODEJS and MySQL. User can pretend as a custom, manager 
and supervisor by running js file

## Installation 

**npm install**

##Usage

**node  bamazonCustomer.js**
* Customer can see the inventory. 
* Buy a product based on the id.
* Inventory gets updated when customer buys 1 or many quantities.
* After each transaction it gives the quantity and total price.

**node  bamazonManager.js**
* Manager can view inventory for sale. 
* View low inventory (less than 5 units).
* Add more units to the inventory.
* Add new product.

**node  bamazonSupervisor.js**
* Supervisor can view product sales per dpertment. 
* Create new Department

