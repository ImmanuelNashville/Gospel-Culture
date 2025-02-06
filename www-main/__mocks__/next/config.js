const mock = jest.fn().mockImplementation(() => ({
  publicRuntimeConfig: {
    NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN: 'test',
  },
}));

export default mock;
