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

## Troubleshooting Base Currency Conversion

If a listed base currency doesn't seem to be working or if the conversion to the target price fails, it might be due to our regular expression (regex) not correctly matching the price.

If you encounter this issue, you can do either of the following:

1. **Open an Issue:** If you're not familiar with technical changes or regex, you can open an issue on our GitHub repository. Describe the problem you're facing, including the base currency that's not working and any relevant details. This helps us investigate and resolve the issue efficiently.

2. **Update the Regex:** If you have the technical skills and knowledge of regular expressions, you can update the regex in `utils/parsers.js`. By improving the regex pattern, you can help ensure accurate matching of prices for the affected base currency.

We appreciate your assistance in troubleshooting and improving the currency conversion tool!

## Contact

For questions, support, or any clarifications, feel free to reach out to us on [GitHub Discussions](https://github.com/Solidet-com/steam-currency-converter/discussions) or via email at trsnaqe@gmail.com.

We appreciate your contributions and look forward to working with you!
