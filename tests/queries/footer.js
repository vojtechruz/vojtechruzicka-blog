export function getFooter($) {
  return $('footer.footer');
}

export function getFooterContainer($) {
  return $('footer.footer .footer-container');
}

export function getSocialNav($) {
  return $('footer.footer nav.footer-social');
}

export function getSocialLinks($) {
  return $('footer.footer nav.footer-social a.footer-icon');
}

export function getSocialLinkHrefs($) {
  return getSocialLinks($)
    .map((_, el) => $(el).attr('href'))
    .get();
}

export function getSocialLinkByHref($, href) {
  return $(`footer.footer nav.footer-social a.footer-icon[href="${href}"]`);
}
