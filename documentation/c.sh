#!/bin/bash
for f in *.png; do
    convert "$f" "${f%.png}.jpg"
    rm "$f"
done
