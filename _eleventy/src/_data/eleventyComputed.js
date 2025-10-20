export default {
  metaTitle: (data) =>
    data.title ? `${data.title} | ${data.site.title}` : data.site.title,
};
