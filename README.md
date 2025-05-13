# MedRef: Medical Reference Citation Docker Image

This Docker image provides a lightweight, web-based tool for generating formatted medical citations from DOIs. The interface allows users to paste or input a DOI, select a citation format, and obtain a properly styled reference in real time. It includes support for major citation styles used in medical and scientific publishing.

## 📦 How to Run the Container

This image can be executed in the following ways:

### 1. HTTP Mode

```bash
docker run -d --name test_medref -p 8080:80 humbertovvaronafong/medref
```

### 2. HTTPS with Automatic Certificates (Let's Encrypt)

```bash
docker run -d -p 8443:443 \
  --name test_medref \
  -e REDIRECT_TO_HTTPS=yes \
  -e AUTOCERT=yes \
  humbertovvaronafong/medref
```

### 3. HTTPS with Manual Certificates

```bash
docker run -d --name test_medref \
  -e REDIRECT_TO_HTTPS=yes \
  -p 8443:443 \
  humbertovvaronafong/medref
```

### 4. Docker Compose Example

You can also use Docker Compose to manage the container:

```yaml
version: "3.8"
services:
  medref:
    image: humbertovvaronafong/medref
    container_name: test_medref
    ports:
      - "8080:80"
      - "8443:443"
    environment:
      - REDIRECT_TO_HTTPS=yes
      - AUTOCERT=yes
    restart: unless-stopped
```

Start the service:

```bash
docker-compose up -d
```

## 🌐 Access in Browser

Use your browser to access the server:

### HTTP Mode

```
http://192.168.1.4:8080/
```

### HTTPS Mode

```
https://192.168.1.4:8443/
```

## 🩺 Health Check

Inspect container health:

```bash
docker inspect --format='{{json .State.Health}}' test_medref | jq
```

## 📃 Logs

To view logs:

```bash
docker logs test_medref
```

---

## ⚙️ Environment Variables

| Variable            | Description                                                    | Default Value |
| ------------------- | -------------------------------------------------------------- | ------------- |
| `TIMEZONE`          | Sets the container timezone                                    | `UTC`         |
| `REDIRECT_TO_HTTPS` | Enables HTTP to HTTPS redirection (`yes` or `no`)              | `no`          |
| `AUTOCERT`          | Enables automatic HTTPS certificate generation (`yes` or `no`) | `no`          |

---

## 🎓 Citation Features

The web app interface supports citation generation using the following formats:

- **AMA** (American Medical Association)
- **APA** (American Psychological Association)
- **ISO 690**
- **Vancouver**
- **MLA** (Modern Language Association)
- **Harvard**
- **ABNT** (Associação Brasileira de Normas Técnicas)
- **Chicago Author-Date**

These formats are selectable from a dropdown menu and automatically applied to the DOI input using `citeproc-js`.

Additional functionalities include:

- DOI validation and formatting
- Real-time citation output
- BibTeX output block
- Export and sort citation history
- Clipboard integration (Paste and Copy)

---

## 🔗 Main repository

- **Zenodo Archive:** [https://zenodo.org/records/15399679](https://zenodo.org/records/15399679)

---

## 👤 Author

**Humberto Vinlay Varona-Fong**
📧 [hvinlay.varona@gmail.com](hvinlay.varona@gmail.com)

---

## 🪪 License

This project is licensed under the **Creative Commons Zero (CC0)** license.
You are free to use, modify, and distribute without restriction.

## How to cite

```
Varona-Fong, H. V. (2025). MedRef: Medical Reference Citation Docker Image (1.0). Zenodo. https://doi.org/10.5281/zenodo.15399679
```
