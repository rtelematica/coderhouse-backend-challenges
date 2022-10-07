import ctr from "./container";


async function products_test() {
    const container = new ctr.Container();
    console.log('Save products')
    await container.save(new ctr.Product('Product 1', 200, 'url1'));
    await container.save(new ctr.Product('Product 2', 300, 'url2'));
    await container.save(new ctr.Product('Product 3', 100, 'url3'));
    await container.save(new ctr.Product('Product 4', 25000, 'url4'));
    
    console.log('Read all products: ', await container.getAll());

    console.log('Delete products 1 & 4')
    await container.deleteById(1);
    await container.deleteById(4);
    console.log('-')
    console.log('Read all products: ', await container.getAll());

    console.log('Searching products')
    console.log('-')
    console.log('Product with id 1: ', await container.getById(1).catch(() => 'Product not exist'));
    console.log('Product with id 2: ', await container.getById(2).catch(() => 'Product not exist'));
    console.log('Product with id 3: ', await container.getById(3).then(() => 'Product exist').catch(() => 'Product not exist'));
    console.log('Product with id 4: ', await container.getById(4).catch(() => {}));
    

    console.log('Delete all products')
    await container.deleteAll();
    console.log('Read all products: ', await container.getAll());
}

products_test()
