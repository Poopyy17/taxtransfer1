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
    ]
}

export default data;