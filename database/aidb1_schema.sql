CREATE TABLE IF NOT EXISTS `cust_info` (
  `customer_id` varchar(50) NOT NULL COMMENT 'customer id',
  `customer_name` varchar(50) NOT NULL COMMENT 'customer name',
  `customer_surname` varchar(50) NOT NULL COMMENT 'customer surname',
  PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB COMMENT='table keep customer information';

CREATE TABLE IF NOT EXISTS `cust_order` (
  `order_id` varchar(50) NOT NULL COMMENT 'order id',
  `customer_id` varchar(50) NOT NULL COMMENT 'customer id from table cust_info.customer_id',
  `order_date` date NOT NULL COMMENT 'order date',
  `order_time` time NOT NULL COMMENT 'order time',
  `order_status` varchar(50) DEFAULT NULL,
  `order_total_unit` bigint NOT NULL DEFAULT (0) COMMENT 'order total unit',
  `order_total_amount` decimal(20,2) NOT NULL COMMENT 'order total amount',
  PRIMARY KEY (`order_id`,`customer_id`) USING BTREE
) ENGINE=InnoDB COMMENT='table keep order master';

CREATE TABLE IF NOT EXISTS `cust_order_detail` (
  `order_id` varchar(50) NOT NULL COMMENT 'order id from table cust_order.order_id',
  `product_id` varchar(50) NOT NULL COMMENT 'product id from table cust_product.product_id',
  `order_date` date NOT NULL COMMENT 'order date',
  `order_time` time NOT NULL COMMENT 'order time',
  `order_unit` bigint NOT NULL COMMENT 'order unit',
  `order_price` decimal(20,2) NOT NULL COMMENT 'order price',
  `order_discount` decimal(20,2) NOT NULL,
  `order_amount` decimal(20,2) NOT NULL COMMENT 'order amount',
  PRIMARY KEY (`order_id`,`product_id`)
) ENGINE=InnoDB COMMENT='table keep product under order from table torder';

CREATE TABLE IF NOT EXISTS `cust_product` (
  `product_id` varchar(50) NOT NULL COMMENT 'product id',
  `product_name` varchar(50) DEFAULT NULL COMMENT 'product name',
  `product_price` decimal(16,2) DEFAULT NULL COMMENT 'product price',
  `product_index` int DEFAULT NULL,
  PRIMARY KEY (`product_id`) USING BTREE
) ENGINE=InnoDB COMMENT='table keep product information';


Use the following tables relationship:

cust_order.customer_id = cust_info.customer_id
cust_order_detail.order_id = cust_order.order_id
cust_order_detail.product_id = cust_product.product_id
