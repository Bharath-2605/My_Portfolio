#!/usr/bin/env python3
"""URL Automation Validation Hub — Excel URL checker.

This is the automation currently used without the React UI.
The checking logic is unchanged. Jupyter widgets still work inside a notebook;
from the terminal, pass an Excel file path.
"""
from __future__ import annotations

import argparse
import os
import socket
import sys
from io import BytesIO
from urllib.parse import urlparse

import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

url_column = "Text"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "close"
}


def normalize_url(value):
    if pd.isna(value) or str(value).strip() == "":
        return None

    url = str(value).strip()

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    return url


def get_domain(url):
    try:
        parsed = urlparse(url)
        return parsed.netloc.lower()
    except Exception:
        return None


def domain_resolves(domain):
    if not domain:
        return False

    domain = domain.split("@")[-1]
    domain = domain.split(":")[0]

    try:
        socket.gethostbyname(domain)
        return True
    except Exception:
        return False


def make_session():
    s = requests.Session()
    s.headers.update(HEADERS)
    s.trust_env = False
    return s


def try_request(url):
    session = make_session()

    try:
        resp = session.get(
            url,
            timeout=15,
            allow_redirects=True
        )
        return resp
    except Exception as e:
        return e


def check_url_status(value):

    url = normalize_url(value)

    if not url:
        return "Not Working - Empty URL"

    candidates = [url]

    if url.startswith("https://"):
        candidates.append("http://" + url[len("https://"):])

    elif url.startswith("http://"):
        candidates.append("https://" + url[len("http://"):])

    parsed = urlparse(url)
    host = parsed.netloc
    path = parsed.path or ""

    if host and not host.startswith("www."):

        if url.startswith("https://"):
            candidates.append(f"https://www.{host}{path}")
            candidates.append(f"http://www.{host}{path}")

        else:
            candidates.append(f"http://www.{host}{path}")
            candidates.append(f"https://www.{host}{path}")

    reasons = []

    for candidate in candidates:

        domain = get_domain(candidate)
        dns_ok = domain_resolves(domain)

        result = try_request(candidate)

        if not isinstance(result, Exception):

            if result.status_code < 400:
                return "Working"

            if result.status_code in (401, 403):
                return "Working"

            reasons.append(f"HTTP {result.status_code}")

            if dns_ok and result.status_code < 500:
                return "Working"

        else:

            err = str(result)

            if "Connection reset by peer" in err or "Connection aborted" in err:
                if dns_ok:
                    return "Working"

                reasons.append("Connection reset by peer")
                continue

            if "SSLError" in err:
                reasons.append("SSL Error")

                if dns_ok:
                    return "Working"

                continue

            if "Timeout" in err:
                reasons.append("Timeout")
                continue

            reasons.append(err)

    if reasons:
        return f"Not Working - {reasons[-1]}"

    return "Not Working - Unknown Error"


def process_excel_file(file_content, file_name):
    file_root, file_ext = os.path.splitext(file_name)

    input_data = BytesIO(file_content)

    try:
        df = pd.read_excel(input_data)

    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return None

    if url_column not in df.columns:
        print(f"Column '{url_column}' not found in Excel file.")
        return None

    urls = df[url_column].tolist()

    results = [None] * len(urls)

    max_workers = min(20, max(4, len(urls)))

    with ThreadPoolExecutor(max_workers=max_workers) as executor:

        future_map = {
            executor.submit(check_url_status, url): i
            for i, url in enumerate(urls)
        }

        for future in as_completed(future_map):

            idx = future_map[future]

            try:
                results[idx] = future.result()

            except Exception as e:
                results[idx] = (
                    f"Not Working - {type(e).__name__}: {e}"
                )

    df["URL Status"] = results

    output_file = f"{file_root}_output.xlsx"

    df.to_excel(
        output_file,
        index=False
    )

    print(f"Output saved as: {output_file}")
    return output_file


def launch_notebook_ui():
    import ipywidgets as widgets
    from IPython.display import display, FileLink

    upload = widgets.FileUpload(
        accept=".xlsx,.xls",
        multiple=False
    )

    button = widgets.Button(
        description="Process File",
        button_style="primary"
    )

    output = widgets.Output()

    display(upload, button, output)

    def process_uploaded_file():

        if not upload.value:
            print("Please upload an Excel file first.")
            return

        uploaded_file = (
            upload.value[0]
            if isinstance(upload.value, tuple)
            else next(iter(upload.value.values()))
        )

        file_name = (
            uploaded_file["name"]
            if "name" in uploaded_file
            else uploaded_file["metadata"]["name"]
        )

        file_content = uploaded_file["content"]

        output_file = process_excel_file(file_content, file_name)
        if output_file:
            display(FileLink(output_file))

    def on_button_clicked(b):

        with output:
            output.clear_output()
            process_uploaded_file()

    button.on_click(on_button_clicked)


def main():
    parser = argparse.ArgumentParser(
        description="Validate URLs in the Text column of an Excel file."
    )
    parser.add_argument("excel_file", nargs="?", help="Path to a .xlsx or .xls workbook")
    args = parser.parse_args()

    if args.excel_file:
        path = args.excel_file
        with open(path, "rb") as handle:
            process_excel_file(handle.read(), os.path.basename(path))
        return

    try:
        from IPython import get_ipython

        if get_ipython() is not None:
            launch_notebook_ui()
            return
    except Exception:
        pass

    parser.print_help()
    sys.exit(1)


if __name__ == "__main__":
    main()
