module.exports = ({ config }) => {
  const variant = process.env.APP_VARIANT ?? "development";
  const basePackage = "com.yolah.yolah";

  const variantConfig = {
    development: {
      name: "Yolah Dev",
      package: `${basePackage}.dev`,
      bundleIdentifier: `${basePackage}.dev`,
    },
    preview: {
      name: "Yolah Preview",
      package: `${basePackage}.preview`,
      bundleIdentifier: `${basePackage}.preview`,
    },
    production: {
      name: "Yolah",
      package: basePackage,
      bundleIdentifier: basePackage,
    },
  };

  const selected = variantConfig[variant] ?? variantConfig.production;

  return {
    ...config,
    name: selected.name,
    ios: {
      ...config.ios,
      bundleIdentifier: selected.bundleIdentifier,
    },
    android: {
      ...config.android,
      package: selected.package,
    },
    extra: {
      ...config.extra,
      appVariant: variant,
    },
  };
};
