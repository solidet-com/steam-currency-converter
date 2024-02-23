# Contributing to Steam Currency Converter

Thank you for considering contributing to the Steam Currency Converter! Your contributions help improve the tool for everyone. Here are some guidelines to help you get started:

## Reporting Issues

If you encounter a bug or have a feature request, your input is valuable! Please open an issue on our GitHub repository. Before creating a new issue, take a moment to check if a similar one already exists. This helps us keep discussions focused and avoid duplication.

## Making Pull Requests

We welcome your code contributions! To streamline the process, follow these steps:

1. Fork the repository and create a new branch for your changes.
   
2. Write clear commit messages, explaining the purpose of your changes. Clear communication makes it easier for reviewers to understand and assess your contributions.

3. Submit a pull request to the `main` branch. We'll review your changes promptly.

## Currency Formatting Specific Pull Requests

For currency formatting specific pull requests, please provide the source of the formatting for the given currency. Add the formatting details for the currency in `data/locales.js` under `CURRENCY_INFORMATIONS`. For example:

```javascript
const CURRENCY_INFORMATIONS = [
    ...BASE_CURRENCIES,
    {
        id: 42,
        abbr: "DKK",
        symbol: "kr",
        hint: "Danish Krone",
        multiplier: 100,
        unit: 1,
        format: {
            places: 2,
            hidePlacesWhenZero: false,
            symbolFormat: " kr",
            thousand: ".",
            decimal: ",",
            right: true,
        },
    },
    // Add your new currency formatting here
];
```

By providing the source of the formatting, you help us maintain transparency and ensure accurate implementation. 

## Contact

For questions, support, or any clarifications, feel free to reach out to us on [GitHub Discussions](https://github.com/Solidet-com/steam-currency-converter/discussions) or via email at trsnaqe@gmail.com.

We appreciate your contributions and look forward to working with you!
