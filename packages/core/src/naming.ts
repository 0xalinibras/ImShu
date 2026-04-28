export function generateSmartName(name: string, appsToken: string, metaToken: string) {
    // const apps = [...new Set(
    //     (execSync("tasklist")
    //     .toString()
    //     .split("\n")
    //     .slice(3)
    //     .map(l=>l.trim().split(/\s+/)[0])
    //     .filter(Boolean)
    //     .map(x=>x.toLowerCase()))
    // )].filter(app =>
    //     ![
    //         "svchost.exe","system","registry","idle","csrss.exe","winlogon.exe","services.exe",
    //         "tasklist","lsass.exe","smss.exe","dwm.exe","runtimebroker.exe","searchindexer.exe",
    //         "searchhost.exe","wmiprvse.exe","ctfmon.exe","taskhostw.exe","spoolsv.exe","audiodg.exe",
    //         "conhost.exe","msmpeng.exe","nissrv.exe","securityhealthsystray.exe","wininit.exe",
    //         "secure","memory","appactions.exe","crossdeviceresume.exe","officeclicktorun.exe","lsaiso.exe"
    //     ].includes(app)
    //     &&
    //     !["helper","service","container","host","broker","engine","prism","sonar"]
    //     .some(p=>app.includes(p))
    // )
    // .sort()
    // .join(",");

    // const { token: appsToken, encryptedData: appsEncrypted } = encrypt(apps);
    // const { token: metaToken, encryptedData: metaEncrypted } = encrypt(JSON.stringify(tempFile));

    // const encryptionRepository = new EncryptionRepository()

    // encryptionRepository.save(appsToken, "context", appsEncrypted);
    // encryptionRepository.save(metaToken, "metadata", metaEncrypted);

    return `${name}_${appsToken}0${metaToken}`
}
