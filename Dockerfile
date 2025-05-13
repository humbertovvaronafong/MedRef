FROM humbertovvaronafong/tiny-webserver:1.0

ARG BUILD_DATE
ARG VERSION="1.0"

LABEL maintainer="HV Varona-Fong"
LABEL build_version="MedCitation (MedRef) version:- ${VERSION} Build-date:- ${BUILD_DATE}"
LABEL org.opencontainers.image.authors="Humbero V. Varona-Fong <hvinlay.varona@gmail.com>"
LABEL org.opencontainers.image.description="Medical Reference Citations (MedRef)"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"

ENV TIMEZONE=America/Havana
ENV REDIRECT_TO_HTTPS=yes
ENV AUTOCERT=no

COPY index.html /config/www/index.html
COPY script.js /config/www/script.js
COPY styles.css /config/www/styles.css
COPY citation_formats.json /config/www/citation_formats.json

EXPOSE 80 443
