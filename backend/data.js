import bcrypt from 'bcryptjs'

const data = {
    users: [
        {
            name: 'James',
            email: 'admin@dev.com',
            password: bcrypt.hashSync('1234'),
            isAdmin: true
        },
        {
            name: 'Obet',
            email: 'user@dev.com',
            password: bcrypt.hashSync('1234'),
            isAdmin: false
        }
    ],
    services: [
        {
            name: 'Property Tax Transferral',
            slug: 'property-tax-transferral',
            category: 'Property',
            image: '/images/transferCertificate.png',
            price: 220,
            description: 'Submit your requirements to start!'
        },
        {
            name: 'Income Tax Transferral',
            slug: 'income-tax-transferral',
            category: 'Income',
            image: '/images/transferCertificate.png',
            price: 320,
            description: 'Submit your requirements to start!'
        },
        {
            name: 'Tax Credits Transferral',
            slug: 'tax-credits-transferral',
            category: 'Credits',
            image: '/images/transferCertificate.png',
            price: 420,
            description: 'Submit your requirements to start!'
        },
        {
            name: 'Tax Deduction Transferral',
            slug: 'tax-deduction-transferral',
            category: 'Deduction',
            image: '/images/transferCertificate.png',
            price: 520,
            description: 'Submit your requirements to start!'
        },
    ]
}

export default data;