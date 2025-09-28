# Book Keeping System Backend

A robust backend service built with TypeScript and Node.js for fostering a lifelong love for reading by offering a carefully curated selection of books that appeal to young minds. Subscription based model.

## 🚀 Features

- User Authentication (Local, Google, Facebook)
- Book Management System
- Invoice generation recurring for each monthly, biannually, yearly subscription
- Box update for each invoice
- Analytical Dashboard with full control of admin
- Customer portal for managing box, subscription, account and payment
- Book ordering system

## 🛠️ Tech Stack

- **Backend**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: OAuth2 (Google, Facebook) with passport.js
- **Email**: Nodemailer
- **File Upload**: Express-fileupload with aws s3 bucket
- **Security**: bcrypt, JWT, security-audit, rate-limiting
- **Logging**: Winston with daily rotate file
- **Process Management**: PM2
- **Development Tools**: ESLint, Prettier, Husky

## 📋 Prerequisites

- Node.js (v20 or higher)
- MongoDB
- Docker (optional, for containerization)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/fahadhossain24/book-kipping-server.git
cd book-kipping-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

5. Build the production version:
```bash
npm run build
```

6. Start the production server:
```bash
npm run start
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## 📢 Support
For support, email fahadhossain0503@gmail.com


<!-- Security scan triggered at 2025-09-02 04:15:43 -->

<!-- Security scan triggered at 2025-09-02 16:12:33 -->

<!-- Security scan triggered at 2025-09-09 05:47:48 -->

<!-- Security scan triggered at 2025-09-28 15:57:41 -->