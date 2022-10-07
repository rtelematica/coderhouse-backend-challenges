'use strict';

import fs from 'fs';


const productsFileName = 'productos.txt'

let globalProducts = []

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
        if(globalProducts.length === 0) {
            product.id = 1;
        } else {
            product.id = globalProducts[globalProducts.length - 1].id + 1;
        }
        globalProducts.push(product);
    }

    @onlyread()
    async getById(id) {
        const product = globalProducts.filter(p => p.id === id)
        if (product.length === 0) {
            throw new Exception('Product not exist');
        }

        return product;
    }

    @onlyread()
    async getAll() {
        return globalProducts;
    }

    @persist()
    async deleteById(id) {
        const productsWithoutSearchElement = globalProducts.filter(p => p.id !== id);
        globalProducts = productsWithoutSearchElement;
    }

    @persist()
    async deleteAll() {
        globalProducts = [];
    }
}

// Decorator to read the products.txt file and persist the elements 
// of the products array in products.txt
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

// Decorator to read the products.txt
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
        globalProducts = JSON.parse(productsJSONString);
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
        await fs.promises.writeFile(`./${productsFileName}`, JSON.stringify(globalProducts));
    } catch (error) {
        console.error('Error persisting product', error);
    }
}

export default { Container, Product }