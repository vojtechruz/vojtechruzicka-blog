pandoc java-10-var.html --standalone --from=html --to=markdown --output=java-10-var.md --wrap=none
asciidoctor -D output java-10-var.md
pause