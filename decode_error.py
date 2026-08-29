error_msg = "เน€เธ˜ยŠเน€เธ˜เธ—เน€เธ™ยˆเน€เธ˜เธ เน€เธ˜ยœเน€เธ˜เธ™เน€เธ™ย‰เน€เธ™ยƒเน€เธ˜ยŠเน€เธ™ย‰เน€เธ˜ย‡เน€เธ˜เธ’เน€เธ˜ย™เน€เธ˜เธ‹เน€เธ˜เธƒเน€เธ˜เธ—เน€เธ˜เธ เน€เธ˜เธƒเน€เธ˜เธ‹เน€เธ˜เธ‘เน€เธ˜เธŠเน€เธ˜ยœเน€เธ™ยˆเน€เธ˜เธ’เน€เธ˜ย™เน€เธ™ย„เน€เธ˜เธ เน€เธ™ยˆเน€เธ˜โ€“เน€เธ˜เธ™เน€เธ˜ย เน€เธ˜โ€ขเน€เธ™ย‰เน€เธ˜เธ เน€เธ˜ย‡"
# This might be UTF-8 interpreted as Windows-874 or similar. Let's try to encode/decode
try:
    print(error_msg.encode('cp1252').decode('utf-8'))
except:
    pass
try:
    print(error_msg.encode('windows-874').decode('utf-8'))
except:
    pass
