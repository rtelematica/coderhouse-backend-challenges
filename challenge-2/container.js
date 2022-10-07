'use strict';

import fs from 'fs';


const productsFileName = 'productos.txt'

let products = []

class Product {
    constructor(title, price, thumbnail) {
        this.title = title;
        this.price = price;
        this.thumbnail = thumbnail;
    }
}

class Container {

    @persist()
    async save(product) {
        if(products.length === 0) {
            product.id = 1;
        } else {
            product.id = products[products.length - 1].id + 1;
        }
        products.push(product);
    }

    @onlyread()
    async getById(id) {
        const product = products.filter(p => p.id === id)
        if (product.length === 0) {
            throw new Exception('Product not exist');
        }

        return product;
    }

    @onlyread()
    async getAll() {
        return products;
    }

    @persist()
    async deleteById(id) {
        const productsWithoutSearchElement = products.filter(p => p.id !== id);
        products = productsWithoutSearchElement;
    }

    @persist()
    async deleteAll() {
        products = [];
    }
}

function persist() {
    return (target, key, descriptor) => {
        let fn = descriptor.value;
        descriptor.value = async (...args) => {        
            await readProductsFile();
            const response = fn.call(this, ...args)
            await writeProductsFile();

            return response;
        }

        return descriptor;
    }
}

function onlyread() {
    return (target, key, descriptor) => {
        let fn = descriptor.value;
        descriptor.value = async (...args) => {        
            await readProductsFile();
            return fn.call(this, ...args);
        }

        return descriptor;
    }
}

async function readProductsFile() {
    try {
        const productsJSONString = await fs.promises.readFile(`./${productsFileName}`, 'utf-8');
        products = JSON.parse(productsJSONString);
    } catch (error) {
        if (error.code === 'ENOENT' && error.syscall === 'open') {
            await fs.promises.writeFile(`./${productsFileName}`, '[]');
            return;
        }
        console.error(error);
    }
}

async function writeProductsFile() {
    try {
        await fs.promises.writeFile(`./${productsFileName}`, JSON.stringify(products));
    } catch (error) {
        console.error('Error persisting product', error);
    }
}

export default { Container, Product }