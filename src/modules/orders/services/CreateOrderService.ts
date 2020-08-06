import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if(!customer){
      throw new AppError('Customer not found');
    }

    const productIds = products.map(product => { return { id: product.id} });

    if(!customer){
      throw new AppError('Customer not found');
    }

    const findProducts = await this.productsRepository.findAllById(productIds);

    if(!findProducts || findProducts.length === 0){
      throw new AppError('Product(s) not found');
    }

    const orderProducts = findProducts.map(product => {
      const findProduct = products.find(productFound => productFound.id === product.id);

      if(findProduct && findProduct.quantity > product.quantity){
        throw new AppError(`Insufficent quantity for product: ${product.name}`);
      }

      return {
        product_id: product.id,
        price: product.price,
        quantity: findProduct?.quantity || 0,
      }
    });

    const quantityOrderProducts = orderProducts.map(product => {
      const findProduct = findProducts.find(productFound => productFound.id === product.product_id);

      const quantity = findProduct?.quantity || 0;

      return {
        id: product.product_id,
        quantity: quantity - product.quantity
      }
    });

    await this.productsRepository.updateQuantity(quantityOrderProducts);

    const order = await this.ordersRepository.create({ customer, products: orderProducts });

    return order;
  }
}

export default CreateOrderService;
