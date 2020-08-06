import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  JoinTable,
} from 'typeorm';

import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity('orders')
class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, {
    cascade: ['insert', 'update'],
    eager: true
  })
  @JoinColumn({ name: 'customer_id' })
  @JoinTable()
  customer: Customer;

  @OneToMany(type => OrdersProducts, ordersProducts => ordersProducts.order, {
    cascade: ['insert', 'update'],
    eager: true
  })
  @JoinTable()
  order_products: OrdersProducts[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Order;
